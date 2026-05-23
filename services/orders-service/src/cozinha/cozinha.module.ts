import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemPedido } from '../entities/item-pedido.entity';
import { Pedido } from '../entities/pedido.entity';
import { PedidosModule } from '../pedidos/pedidos.module';
import { CozinhaController } from './cozinha.controller';
import { CozinhaService } from './cozinha.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido]), PedidosModule],
  controllers: [CozinhaController],
  providers: [CozinhaService],
})
export class CozinhaModule {}
