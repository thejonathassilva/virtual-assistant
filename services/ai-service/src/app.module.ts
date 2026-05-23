import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedrockModule } from './bedrock/bedrock.module';
import { ChatModule } from './chat/chat.module';
import { ConfigIaModule } from './config-ia/config-ia.module';
import { ConfigIa } from './entities/config-ia.entity';
import { LogConversa } from './entities/log-conversa.entity';
import { MetricaIaDiaria } from './entities/metrica-ia-diaria.entity';
import { HealthController } from './health.controller';
import { MetricasModule } from './metricas/metricas.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [ConfigIa, LogConversa, MetricaIaDiaria],
      synchronize: true,
    }),
    RedisModule,
    BedrockModule,
    ChatModule,
    ConfigIaModule,
    MetricasModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
