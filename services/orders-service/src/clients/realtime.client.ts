import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Pedido } from '../entities/pedido.entity';

@Injectable()
export class RealtimeClient {
  private readonly logger = new Logger(RealtimeClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl =
      config.get<string>('REALTIME_SERVICE_URL') ??
      'http://realtime-service:3006';
  }

  async emitNovoPedido(pedido: Pedido): Promise<void> {
    const url = `${this.baseUrl}/events/novo-pedido`;
    try {
      await firstValueFrom(
        this.http.post(url, {
          pedido_id: pedido.id,
          mesa_id: pedido.mesa_id,
          sessao_id: pedido.sessao_id,
          status: pedido.status,
          origem: pedido.origem,
          valor_total: pedido.valor_total,
          itens: pedido.itens?.map((item) => ({
            id: item.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            observacoes: item.observacoes,
            preco_unitario: item.preco_unitario,
            status: item.status,
          })),
          created_at: pedido.created_at,
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Falha ao notificar realtime (novo-pedido) para pedido ${pedido.id}`,
        error,
      );
    }
  }

  private payloadFromPedido(pedido: Pedido) {
    return {
      pedido_id: pedido.id,
      mesa_id: pedido.mesa_id,
      sessao_id: pedido.sessao_id,
      status: pedido.status,
      origem: pedido.origem,
      valor_total: pedido.valor_total,
      itens: pedido.itens?.map((item) => ({
        id: item.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        observacoes: item.observacoes,
        preco_unitario: item.preco_unitario,
        status: item.status,
      })),
      created_at: pedido.created_at,
    };
  }

  async emitPedidoAtualizado(pedido: Pedido): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/events/pedido-atualizado`, this.payloadFromPedido(pedido)),
      );
    } catch (error) {
      this.logger.warn(`Falha realtime pedido-atualizado ${pedido.id}`, error);
    }
  }

  async emitPedidoPronto(pedido: Pedido): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/events/pedido-pronto`, this.payloadFromPedido(pedido)),
      );
    } catch (error) {
      this.logger.warn(`Falha realtime pedido-pronto ${pedido.id}`, error);
    }
  }
}
