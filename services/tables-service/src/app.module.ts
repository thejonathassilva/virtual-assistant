import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './database/typeorm-options';
import { HealthController } from './health.controller';
import { Mesa } from './mesas/entities/mesa.entity';
import { SessaoMesa } from './mesas/entities/sessao-mesa.entity';
import { MesasModule } from './mesas/mesas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildTypeOrmOptions([Mesa, SessaoMesa])),
    MesasModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
