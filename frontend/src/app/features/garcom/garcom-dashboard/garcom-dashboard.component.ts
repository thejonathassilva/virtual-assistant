import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MesasService } from '../../../core/services/mesas.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { ProdutoCatalogoStore } from '../../../core/services/produto-catalogo.store';
import { RealtimeService } from '../../../core/services/realtime.service';
import { Mesa, Pedido, Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Socket } from 'socket.io-client';

@Component({
  selector: 'app-garcom-dashboard',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, ...MATERIAL_IMPORTS],
  templateUrl: './garcom-dashboard.component.html',
  styleUrl: './garcom-dashboard.component.scss',
})
export class GarcomDashboardComponent implements OnInit, OnDestroy {
  private readonly mesasSvc = inject(MesasService);
  private readonly pedidos = inject(PedidosService);
  private readonly catalog = inject(CatalogService);
  private readonly catalogo = inject(ProdutoCatalogoStore);
  private readonly realtime = inject(RealtimeService);
  private socket?: Socket;

  mesas = signal<Mesa[]>([]);
  selecionada = signal<Mesa | null>(null);
  pedido = signal<Pedido | null>(null);
  produtos = signal<Produto[]>([]);
  produtoId = signal('');
  qtd = signal(1);
  alerta = signal<string | null>(null);

  ngOnInit(): void {
    this.refreshMesas();
    this.catalogo.ensureLoaded();
    this.catalog.getCardapio().subscribe((p) => this.produtos.set(p));
    this.socket = this.realtime.connectGarcom();
    this.realtime
      .onEvent<{ mesa_id?: string }>(this.socket, 'pedido-pronto')
      .subscribe((data) => {
        this.alerta.set(`Pedido pronto — mesa ${data.mesa_id?.slice(0, 8)}`);
        this.refreshMesas();
      });
    this.realtime.onEvent(this.socket, 'chamar-garcom').subscribe(() => {
      this.alerta.set('Cliente chamou o garçom!');
    });
  }

  ngOnDestroy(): void {
    if (this.socket) this.realtime.disconnect(this.socket);
  }

  refreshMesas(): void {
    this.mesasSvc.listar().subscribe((m) => this.mesas.set(m));
  }

  selecionar(m: Mesa): void {
    this.selecionada.set(m);
    this.pedidos.pedidoAtualMesa(m.id).subscribe({
      next: (p) => this.pedido.set(p),
      error: () => this.pedido.set(null),
    });
  }

  statusClass(m: Mesa): string {
    if (m.status === 'livre') return 'livre';
    if (m.status === 'aguardando_pagamento') return 'pagamento';
    return 'ocupada';
  }

  adicionarItem(): void {
    const p = this.pedido();
    const mesa = this.selecionada();
    if (!mesa || !this.produtoId()) return;

    const criarEAdicionar = (pedido: Pedido) => {
      this.pedidos
        .adicionarItem(pedido.id, this.produtoId(), this.qtd())
        .subscribe((atualizado) => {
          this.pedido.set(atualizado);
        });
    };

    if (p) {
      criarEAdicionar(p);
    } else if (mesa.sessao_ativa_id) {
      this.pedidos
        .criarPedido(mesa.id, mesa.sessao_ativa_id, 'garcom')
        .subscribe(criarEAdicionar);
    }
  }

  nomeProduto(produtoId: string): string {
    return this.catalogo.get(produtoId)?.nome ?? 'Item';
  }

  enviarCozinha(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidos.enviarCozinha(p.id).subscribe((atualizado) => {
      this.pedido.set(atualizado);
      this.refreshMesas();
    });
  }
}
