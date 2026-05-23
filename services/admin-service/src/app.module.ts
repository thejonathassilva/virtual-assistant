import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaModule } from './empresa/empresa.module';
import { HealthController } from './health.controller';
import { Empresa } from './empresa/entities/empresa.entity';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Empresa],
      synchronize: true,
    }),
    EmpresaModule,
    ProxyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
