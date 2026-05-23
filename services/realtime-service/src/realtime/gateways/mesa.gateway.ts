import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { MESA_NAMESPACE_PATTERN } from '../constants';
import { socketCorsOptions } from '../cors.util';

@WebSocketGateway({
  namespace: MESA_NAMESPACE_PATTERN,
  cors: socketCorsOptions(),
})
export class MesaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MesaGateway.name);

  @WebSocketServer()
  namespace!: Namespace;

  handleConnection(client: Socket): void {
    this.logger.debug(`Cliente conectado em ${client.nsp.name}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Cliente desconectado de ${client.nsp.name}`);
  }
}
