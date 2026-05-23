import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TablesClient {
  private readonly logger = new Logger(TablesClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl =
      config.get<string>('TABLES_SERVICE_URL') ?? 'http://tables-service:3003';
  }

  async encerrarSessao(sessaoId: string): Promise<void> {
    const url = `${this.baseUrl}/sessoes/${sessaoId}/encerrar`;
    try {
      await firstValueFrom(this.http.put(url));
    } catch (error) {
      this.logger.error(`Falha ao encerrar sessão ${sessaoId}`, error);
      throw new ServiceUnavailableException('Serviço de mesas indisponível');
    }
  }
}
