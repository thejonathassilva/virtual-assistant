import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { BedrockService } from './bedrock.service';
import { ToolExecutorService } from './tool-executor.service';

@Module({
  imports: [ClientsModule],
  providers: [BedrockService, ToolExecutorService],
  exports: [BedrockService, ToolExecutorService],
})
export class BedrockModule {}
