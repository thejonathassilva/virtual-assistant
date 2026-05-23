import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaixaModule } from './caixa/caixa.module';
import { CozinhaModule } from './cozinha/cozinha.module';
import { ItemPedido } from './entities/item-pedido.entity';
import { Pedido } from './entities/pedido.entity';
import { HealthController } from './health.controller';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Pedido, ItemPedido],
      synchronize: true,
    }),
    PedidosModule,
    CozinhaModule,
    CaixaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
