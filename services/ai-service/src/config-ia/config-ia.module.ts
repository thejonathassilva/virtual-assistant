import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedrockModule } from '../bedrock/bedrock.module';
import { ConfigIa } from '../entities/config-ia.entity';
import { SessionModule } from '../session/session.module';
import { ConfigIaController } from './config-ia.controller';
import { ConfigIaService } from './config-ia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConfigIa]),
    BedrockModule,
    SessionModule,
  ],
  controllers: [ConfigIaController],
  providers: [ConfigIaService],
  exports: [ConfigIaService],
})
export class ConfigIaModule {}
