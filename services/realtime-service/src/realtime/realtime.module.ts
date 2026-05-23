import { Module } from '@nestjs/common';
import { CozinhaGateway } from './gateways/cozinha.gateway';
import { GarcomGateway } from './gateways/garcom.gateway';
import { MesaGateway } from './gateways/mesa.gateway';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './realtime.service';

@Module({
  controllers: [RealtimeController],
  providers: [
    RealtimeService,
    CozinhaGateway,
    GarcomGateway,
    MesaGateway,
  ],
  exports: [RealtimeService],
})
export class RealtimeModule {}
