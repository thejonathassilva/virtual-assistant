import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaModule } from '../empresa/empresa.module';
import { Restaurante } from './entities/restaurante.entity';
import { InternalRestaurantesController } from './internal-restaurantes.controller';
import { PlatformRestaurantesController } from './platform-restaurantes.controller';
import { RestauranteService } from './restaurante.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Restaurante]), EmpresaModule],
  controllers: [PlatformRestaurantesController, InternalRestaurantesController],
  providers: [RestauranteService],
  exports: [RestauranteService],
})
export class RestauranteModule {}
