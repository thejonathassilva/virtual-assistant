import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './database/typeorm-options';
import { EmpresaModule } from './empresa/empresa.module';
import { HealthController } from './health.controller';
import { Empresa } from './empresa/entities/empresa.entity';
import { Restaurante } from './restaurante/entities/restaurante.entity';
import { RestauranteModule } from './restaurante/restaurante.module';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildTypeOrmOptions([Empresa, Restaurante])),
    EmpresaModule,
    RestauranteModule,
    ProxyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
