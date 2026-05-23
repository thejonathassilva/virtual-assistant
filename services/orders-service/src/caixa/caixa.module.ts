import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from '../clients/clients.module';
import { Pedido } from '../entities/pedido.entity';
import { CaixaController } from './caixa.controller';
import { CaixaService } from './caixa.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido]), ClientsModule],
  controllers: [CaixaController],
  providers: [CaixaService],
})
export class CaixaModule {}
