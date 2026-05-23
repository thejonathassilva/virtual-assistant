import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersClient {
  private readonly logger = new Logger(OrdersClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl =
      config.get<string>('ORDERS_SERVICE_URL') ?? 'http://orders-service:3004';
  }

  async getPedidoAtual(mesaId: string): Promise<unknown> {
    const url = `${this.baseUrl}/mesas/${mesaId}/pedido-atual`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async createPedido(body: {
    mesa_id: string;
    sessao_id: string;
    origem: string;
    enviar_cozinha?: boolean;
  }): Promise<unknown> {
    const url = `${this.baseUrl}/pedidos`;
    const { data } = await firstValueFrom(this.http.post(url, body));
    return data;
  }

  async addItem(
    pedidoId: string,
    body: { produto_id: string; quantidade: number; observacoes?: string },
  ): Promise<unknown> {
    const url = `${this.baseUrl}/pedidos/${pedidoId}/itens`;
    const { data } = await firstValueFrom(this.http.post(url, body));
    return data;
  }

  async removeItem(pedidoId: string, itemId: string): Promise<unknown> {
    const url = `${this.baseUrl}/pedidos/${pedidoId}/itens/${itemId}`;
    const { data } = await firstValueFrom(this.http.delete(url));
    return data;
  }

  async enviarCozinha(pedidoId: string): Promise<unknown> {
    const url = `${this.baseUrl}/pedidos/${pedidoId}/enviar-cozinha`;
    const { data } = await firstValueFrom(this.http.post(url, {}));
    return data;
  }

  async safeGetPedidoAtual(mesaId: string): Promise<unknown | null> {
    try {
      return await this.getPedidoAtual(mesaId);
    } catch {
      return null;
    }
  }

  async safeCreatePedido(body: {
    mesa_id: string;
    sessao_id: string;
    origem: string;
  }): Promise<unknown> {
    try {
      return await this.createPedido(body);
    } catch (error) {
      this.logger.warn('Falha ao criar pedido', error);
      throw error;
    }
  }
}
