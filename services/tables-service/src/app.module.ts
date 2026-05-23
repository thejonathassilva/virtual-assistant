import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { Mesa } from './mesas/entities/mesa.entity';
import { SessaoMesa } from './mesas/entities/sessao-mesa.entity';
import { MesasModule } from './mesas/mesas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Mesa, SessaoMesa],
      synchronize: true,
    }),
    MesasModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
