import { Controller, ForbiddenException, Get, Headers, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MetricasService } from './metricas.service';

@ApiTags('metricas-ia')
@Controller('metricas-ia')
export class MetricasController {
  constructor(private readonly metricasService: MetricasService) {}

  @Get('platform')
  @ApiOperation({ summary: 'Métricas IA por restaurante (platform owner)' })
  @ApiQuery({
    name: 'periodo',
    required: false,
    enum: ['hoje', 'semana', 'mes'],
  })
  @ApiQuery({ name: 'restaurante_id', required: false })
  getMetricasPlatform(
    @Headers('x-user-role') role: string | undefined,
    @Query('periodo') periodo?: string,
    @Query('restaurante_id') restauranteId?: string,
  ) {
    if (role !== 'platform_owner') {
      throw new ForbiddenException('Acesso restrito ao administrador da plataforma');
    }
    return this.metricasService.getMetricasPlatform(periodo ?? 'semana', restauranteId);
  }

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
