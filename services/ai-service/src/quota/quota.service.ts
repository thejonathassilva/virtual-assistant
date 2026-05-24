import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_RESTAURANTE_ID } from '../common/tenant';

@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private baseUrl(): string {
    return (
      this.config.get<string>('ADMIN_SERVICE_URL') ?? 'http://admin-service:3007'
    ).replace(/\/$/, '');
  }

  async assertCanConsume(
    restauranteId: string = DEFAULT_RESTAURANTE_ID,
    tokens = 200,
  ): Promise<void> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ percentual_uso?: number; quota_ilimitada?: boolean }>(
          `${this.baseUrl()}/internal/restaurantes/${restauranteId}/cota`,
        ),
      );
      if (data.quota_ilimitada) return;
      if ((data.percentual_uso ?? 0) >= 100) {
        throw new Error('Cota mensal de IA esgotada para este restaurante');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('esgotada')) {
        throw err;
      }
      this.logger.warn('Nao foi possivel validar cota; permitindo uso em dev');
    }
  }

  async registrarTokens(
    restauranteId: string,
    tokens: number,
  ): Promise<void> {
    if (tokens <= 0) return;
    try {
      await firstValueFrom(
        this.http.post(
          `${this.baseUrl()}/internal/restaurantes/${restauranteId}/tokens`,
          { tokens },
        ),
      );
    } catch (err) {
      this.logger.warn(`Falha ao registrar tokens: ${err}`);
    }
  }
}
