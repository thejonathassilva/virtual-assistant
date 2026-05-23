import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

  async emitChamarGarcom(payload: {
    mesa_id: string;
    sessao_id: string;
    motivo: string;
  }): Promise<void> {
    const url = `${this.baseUrl}/events/chamar-garcom`;
    try {
      await firstValueFrom(this.http.post(url, payload));
    } catch (error) {
      this.logger.warn(
        `Falha ao notificar realtime (chamar-garcom) mesa ${payload.mesa_id}`,
        error,
      );
    }
  }
}
