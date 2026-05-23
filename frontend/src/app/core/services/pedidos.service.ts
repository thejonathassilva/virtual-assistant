import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pedido } from '../models';

@Injectable({ providedIn: 'root' })
export class PedidosService {
  constructor(private readonly http: HttpClient) {}

  pedidoAtualMesa(mesaId: string) {
    return this.http.get<Pedido | null>(`${environment.apiUrl}/mesas/${mesaId}/pedido-atual`);
  }

  cozinhaPedidos() {
    return this.http.get<Pedido[]>(`${environment.apiUrl}/cozinha/pedidos`);
  }

  cozinhaEstatisticas() {
    return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/cozinha/estatisticas`);
  }

  atualizarStatusPedido(pedidoId: string, status: string) {
    return this.http.put<Pedido>(`${environment.apiUrl}/pedidos/${pedidoId}/status`, { status });
  }

  atualizarStatusItem(pedidoId: string, itemId: string, status: string) {
    return this.http.put<Pedido>(
      `${environment.apiUrl}/pedidos/${pedidoId}/itens/${itemId}/status`,
      { status },
    );
  }

  cozinhaIniciar(pedidoId: string) {
    return this.http.put<Pedido>(`${environment.apiUrl}/cozinha/pedidos/${pedidoId}/iniciar`, {});
  }

  cozinhaPronto(pedidoId: string) {
    return this.http.put<Pedido>(`${environment.apiUrl}/cozinha/pedidos/${pedidoId}/pronto`, {});
  }

  cozinhaItemPronto(pedidoId: string, itemId: string) {
    return this.http.put<Pedido>(
      `${environment.apiUrl}/cozinha/pedidos/${pedidoId}/itens/${itemId}/pronto`,
      {},
    );
  }

  enviarCozinha(pedidoId: string) {
    return this.http.post<Pedido>(`${environment.apiUrl}/pedidos/${pedidoId}/enviar-cozinha`, {});
  }

  adicionarItem(pedidoId: string, produto_id: string, quantidade: number, observacoes?: string) {
    return this.http.post<Pedido>(`${environment.apiUrl}/pedidos/${pedidoId}/itens`, {
      produto_id,
      quantidade,
      observacoes,
    });
  }

  criarPedido(mesa_id: string, sessao_id: string, origem: string, enviar_cozinha = false) {
    return this.http.post<Pedido>(`${environment.apiUrl}/pedidos`, {
      mesa_id,
      sessao_id,
      origem,
      enviar_cozinha,
    });
  }

  caixaMesasAbertas() {
    return this.http.get<{ mesa_id: string; numero?: number; valor_total: string; pedido_id: string }[]>(
      `${environment.apiUrl}/caixa/mesas-abertas`,
    );
  }

  caixaConta(mesaId: string) {
    return this.http.get<Pedido>(`${environment.apiUrl}/caixa/mesas/${mesaId}/conta`);
  }

  fecharConta(pedidoId: string, forma_pagamento = 'pix') {
    return this.http.put(`${environment.apiUrl}/caixa/pedidos/${pedidoId}/fechar`, {
      forma_pagamento,
    });
  }
}
