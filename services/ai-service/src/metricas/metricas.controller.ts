import { Controller, Get, Query } from '@nestjs/common';
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
  getMetricas(@Query('periodo') periodo?: string) {
    return this.metricasService.getMetricas(periodo);
  }
}
