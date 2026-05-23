import { Component, inject, OnInit, signal } from '@angular/core';
import { PedidosService } from '../../../core/services/pedidos.service';
import { MesasService } from '../../../core/services/mesas.service';
import { ProdutoCatalogoStore } from '../../../core/services/produto-catalogo.store';
import { Pedido, Mesa } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe } from '@angular/common';

interface MesaAberta {
  mesa_id: string;
  pedido_id: string;
  valor_total: string;
  itens_count?: number;
}

@Component({
  selector: 'app-caixa-dashboard',
  standalone: true,
  imports: [CurrencyPipe, ...MATERIAL_IMPORTS],
  templateUrl: './caixa-dashboard.component.html',
  styleUrl: './caixa-dashboard.component.scss',
})
export class CaixaDashboardComponent implements OnInit {
  private readonly pedidos = inject(PedidosService);
  private readonly mesas = inject(MesasService);
  private readonly catalogo = inject(ProdutoCatalogoStore);

  abertas = signal<MesaAberta[]>([]);
  mesasMap = signal<Record<string, Mesa>>({});
  conta = signal<Pedido | null>(null);
  selecionadaId = signal<string | null>(null);
  formaPagamento = signal('pix');

  ngOnInit(): void {
    this.catalogo.ensureLoaded();
    this.mesas.listar().subscribe((list) => {
      const map: Record<string, Mesa> = {};
      list.forEach((m) => (map[m.id] = m));
      this.mesasMap.set(map);
    });
    this.carregarAbertas();
  }

  carregarAbertas(): void {
    this.pedidos.caixaMesasAbertas().subscribe((a) => this.abertas.set(a));
  }

  nomeProduto(produtoId: string): string {
    return this.catalogo.get(produtoId)?.nome ?? 'Item';
  }

  numeroMesa(mesaId: string): string {
    return String(this.mesasMap()[mesaId]?.numero ?? mesaId.slice(0, 8));
  }

  verConta(mesaId: string): void {
    this.selecionadaId.set(mesaId);
    this.pedidos.caixaConta(mesaId).subscribe({
      next: (p) => this.conta.set(p),
      error: () => this.conta.set(null),
    });
  }

  fechar(): void {
    const p = this.conta();
    if (!p) return;
    this.pedidos.fecharConta(p.id, this.formaPagamento()).subscribe({
      next: () => {
        this.conta.set(null);
        this.selecionadaId.set(null);
        this.carregarAbertas();
      },
    });
  }
}
