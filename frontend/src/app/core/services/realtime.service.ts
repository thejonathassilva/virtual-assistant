import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private sockets = new Map<string, Socket>();

  connectCozinha(): Socket {
    return this.connectNamespace('/cozinha');
  }

  connectGarcom(): Socket {
    return this.connectNamespace('/garcom');
  }

  connectMesa(mesaId: string): Socket {
    return this.connectNamespace(`/mesa/${mesaId}`);
  }

  onEvent<T>(socket: Socket, event: string): Observable<T> {
    return new Observable((subscriber) => {
      const handler = (data: T) => subscriber.next(data);
      socket.on(event, handler);
      return () => socket.off(event, handler);
    });
  }

  disconnect(socket: Socket): void {
    socket.disconnect();
    for (const [key, s] of this.sockets.entries()) {
      if (s === socket) this.sockets.delete(key);
    }
  }

  private connectNamespace(namespace: string): Socket {
    const key = namespace;
    if (this.sockets.has(key)) return this.sockets.get(key)!;

    const proxiedViaFrontend =
      environment.production && !environment.wsUrl;
    const socket = proxiedViaFrontend
      ? io(namespace, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
        })
      : io(`${environment.wsUrl || 'http://localhost:3006'}${namespace}`, {
          transports: ['websocket', 'polling'],
        });
    this.sockets.set(key, socket);
    return socket;
  }
}
