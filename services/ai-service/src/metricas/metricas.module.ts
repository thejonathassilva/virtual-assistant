import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricaIaDiaria } from '../entities/metrica-ia-diaria.entity';
import { QuotaModule } from '../quota/quota.module';
import { MetricasController } from './metricas.controller';
import { MetricasService } from './metricas.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetricaIaDiaria]), QuotaModule],
  controllers: [MetricasController],
  providers: [MetricasService],
  exports: [MetricasService],
})
export class MetricasModule {}
