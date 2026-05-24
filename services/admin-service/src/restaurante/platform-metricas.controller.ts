import {
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@ApiTags('platform')
@Controller('platform/metricas-ia')
export class PlatformMetricasController {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private assertPlatform(role?: string) {
    if (role !== 'platform_owner') {
      throw new ForbiddenException('Acesso restrito ao administrador da plataforma');
    }
  }

  private aiBaseUrl(): string {
    return (
      this.config.get<string>('AI_SERVICE_URL') ?? 'http://ai-service:3005'
    ).replace(/\/$/, '');
  }

  @Get()
  @ApiOperation({ summary: 'Métricas IA consolidadas por restaurante (7 dias)' })
  @ApiQuery({ name: 'periodo', required: false, enum: ['hoje', 'semana', 'mes'] })
  @ApiQuery({ name: 'restaurante_id', required: false })
  async getMetricas(
    @Headers('x-user-role') role: string | undefined,
    @Query('periodo') periodo?: string,
    @Query('restaurante_id') restauranteId?: string,
  ) {
    this.assertPlatform(role);
    const params: Record<string, string> = { periodo: periodo ?? 'semana' };
    if (restauranteId) params['restaurante_id'] = restauranteId;

    const { data } = await firstValueFrom(
      this.http.get(`${this.aiBaseUrl()}/metricas-ia/platform`, {
        params,
        headers: { 'x-user-role': 'platform_owner' },
      }),
    );
    return data;
  }
}
