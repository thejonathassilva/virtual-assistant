import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MesasService } from '../../../core/services/mesas.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ProdutoCatalogoStore } from '../../../core/services/produto-catalogo.store';
import { RealtimeService } from '../../../core/services/realtime.service';
import { Pedido } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Socket } from 'socket.io-client';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cozinha-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ...MATERIAL_IMPORTS],
  templateUrl: './cozinha-dashboard.component.html',
  styleUrl: './cozinha-dashboard.component.scss',
})
export class CozinhaDashboardComponent implements OnInit, OnDestroy {
  private readonly pedidos = inject(PedidosService);
  private readonly mesas = inject(MesasService);
  private readonly realtime = inject(RealtimeService);
  private readonly catalogo = inject(ProdutoCatalogoStore);
  private mesasPorId: Record<string, number> = {};
  private socket?: Socket;
  private sub?: Subscription;

  lista = signal<Pedido[]>([]);
  stats = signal<Record<string, unknown> | null>(null);

  ngOnInit(): void {
    this.catalogo.ensureLoaded();
    this.mesas.listar().subscribe((list) => {
      list.forEach((m) => (this.mesasPorId[m.id] = m.numero));
    });
    this.carregar();
    this.socket = this.realtime.connectCozinha();
    this.sub = this.realtime.onEvent<Pedido>(this.socket, 'novo-pedido').subscribe(() => {
      this.carregar();
      this.playSound();
    });
    this.realtime.onEvent(this.socket, 'pedido-atualizado').subscribe(() => this.carregar());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.socket) this.realtime.disconnect(this.socket);
  }

  carregar(): void {
    this.pedidos.cozinhaPedidos().subscribe((p) => this.lista.set(p));
    this.pedidos.cozinhaEstatisticas().subscribe((s) => this.stats.set(s));
  }

  nomeProduto(produtoId: string): string {
    return this.catalogo.get(produtoId)?.nome ?? produtoId.slice(0, 8);
  }

  labelMesa(mesaId: string): string {
    const n = this.mesasPorId[mesaId];
    return n != null ? `Mesa ${n}` : `Mesa ${mesaId.slice(0, 8)}…`;
  }

  iniciar(p: Pedido): void {
    this.pedidos.cozinhaIniciar(p.id).subscribe(() => this.carregar());
  }

  pronto(p: Pedido): void {
    this.pedidos.cozinhaPronto(p.id).subscribe(() => this.carregar());
  }

  itemPronto(p: Pedido, itemId: string): void {
    this.pedidos.cozinhaItemPronto(p.id, itemId).subscribe(() => this.carregar());
  }

  porStatus(status: string): Pedido[] {
    return this.lista().filter((p) => p.status === status);
  }

  private playSound(): void {
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      o.frequency.value = 880;
      o.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } catch {
      /* ignore */
    }
  }
}
