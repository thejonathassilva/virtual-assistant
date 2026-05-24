import { Controller, ForbiddenException, Get, Headers, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MetricasService } from './metricas.service';

@ApiTags('metricas-ia')
@Controller('metricas-ia')
export class MetricasController {
  constructor(private readonly metricasService: MetricasService) {}

  @Get()
  @ApiOperation({ summary: 'Metricas agregadas da IA' })
  @ApiQuery({
    name: 'periodo',
    required: false,
    enum: ['hoje', 'semana', 'mes'],
  })
  getMetricas(
    @Headers('x-user-role') role: string | undefined,
    @Headers('x-restaurante-id') restauranteId: string | undefined,
    @Query('periodo') periodo?: string,
  ) {
    if (role === 'platform_owner') {
      throw new ForbiddenException(
        'Use o painel da plataforma para métricas consolidadas',
      );
    }
    return this.metricasService.getMetricas(periodo, restauranteId);
  }
}
