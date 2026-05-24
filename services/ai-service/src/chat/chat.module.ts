import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedrockModule } from '../bedrock/bedrock.module';
import { ConfigIaModule } from '../config-ia/config-ia.module';
import { LogConversa } from '../entities/log-conversa.entity';
import { MetricasModule } from '../metricas/metricas.module';
import { ClientsModule } from '../clients/clients.module';
import { QuotaModule } from '../quota/quota.module';
import { SessionModule } from '../session/session.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogConversa]),
    SessionModule,
    BedrockModule,
    ConfigIaModule,
    MetricasModule,
    QuotaModule,
    ClientsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
