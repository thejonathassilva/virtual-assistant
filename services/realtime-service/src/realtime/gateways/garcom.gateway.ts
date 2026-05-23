import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace } from 'socket.io';
import { NAMESPACES } from '../constants';
import { socketCorsOptions } from '../cors.util';

@WebSocketGateway({
  namespace: NAMESPACES.GARCOM,
  cors: socketCorsOptions(),
})
export class GarcomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GarcomGateway.name);

  @WebSocketServer()
  namespace!: Namespace;

  handleConnection(): void {
    this.logger.debug('Cliente conectado em /garcom');
  }

  handleDisconnect(): void {
    this.logger.debug('Cliente desconectado de /garcom');
  }
}
