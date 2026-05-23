import { Injectable, Logger } from '@nestjs/common';
import type { Server } from 'socket.io';
import { NAMESPACES, REALTIME_EVENTS } from './constants';
import { EmitEventDto } from './dto/emit-event.dto';
import { CozinhaGateway } from './gateways/cozinha.gateway';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly cozinhaGateway: CozinhaGateway) {}

  private get io(): Server {
    return this.cozinhaGateway.namespace.server;
  }

  private buildPayload(dto: EmitEventDto): Record<string, unknown> {
    return { ...dto };
  }

  private requireMesaId(dto: EmitEventDto, event: string): string {
    if (!dto.mesa_id) {
      throw new Error(`mesa_id é obrigatório para o evento ${event}`);
    }
    return dto.mesa_id;
  }

  private emitToNamespace(
    namespacePath: string,
    event: string,
    data: Record<string, unknown>,
  ): void {
    this.io.of(namespacePath).emit(event, data);
    this.logger.debug(`Emitido ${event} em ${namespacePath}`);
  }

  private emitToMesa(
    mesaId: string,
    event: string,
    data: Record<string, unknown>,
  ): void {
    this.emitToNamespace(NAMESPACES.mesa(mesaId), event, data);
  }

  emitNovoPedido(dto: EmitEventDto): void {
    const data = this.buildPayload(dto);
    this.emitToNamespace(NAMESPACES.COZINHA, REALTIME_EVENTS.NOVO_PEDIDO, data);
    this.emitToNamespace(NAMESPACES.GARCOM, REALTIME_EVENTS.NOVO_PEDIDO, data);
    if (dto.mesa_id) {
      this.emitToMesa(dto.mesa_id, REALTIME_EVENTS.NOVO_PEDIDO, data);
    }
  }

  emitPedidoAtualizado(dto: EmitEventDto): void {
    const data = this.buildPayload(dto);
    this.emitToNamespace(
      NAMESPACES.COZINHA,
      REALTIME_EVENTS.PEDIDO_ATUALIZADO,
      data,
    );
    if (dto.mesa_id) {
      this.emitToMesa(dto.mesa_id, REALTIME_EVENTS.PEDIDO_ATUALIZADO, data);
    }
  }

  emitPedidoPronto(dto: EmitEventDto): void {
    const data = this.buildPayload(dto);
    this.emitToNamespace(NAMESPACES.GARCOM, REALTIME_EVENTS.PEDIDO_PRONTO, data);
    const mesaId = this.requireMesaId(dto, REALTIME_EVENTS.PEDIDO_PRONTO);
    this.emitToMesa(mesaId, REALTIME_EVENTS.PEDIDO_PRONTO, data);
  }

  emitChamarGarcom(dto: EmitEventDto): void {
    const data = this.buildPayload(dto);
    this.emitToNamespace(NAMESPACES.GARCOM, REALTIME_EVENTS.CHAMAR_GARCOM, data);
    if (dto.mesa_id) {
      this.emitToMesa(dto.mesa_id, REALTIME_EVENTS.CHAMAR_GARCOM, data);
    }
  }

  emitMesaAtualizada(dto: EmitEventDto): void {
    const data = this.buildPayload(dto);
    const mesaId = this.requireMesaId(dto, REALTIME_EVENTS.MESA_ATUALIZADA);
    this.emitToNamespace(
      NAMESPACES.GARCOM,
      REALTIME_EVENTS.MESA_ATUALIZADA,
      data,
    );
    this.emitToMesa(mesaId, REALTIME_EVENTS.MESA_ATUALIZADA, data);
  }

  emitRespostaAssistente(dto: EmitEventDto): void {
    const data = this.buildPayload(dto);
    const mesaId = this.requireMesaId(dto, REALTIME_EVENTS.RESPOSTA_ASSISTENTE);
    this.emitToMesa(mesaId, REALTIME_EVENTS.RESPOSTA_ASSISTENTE, data);
  }
}
