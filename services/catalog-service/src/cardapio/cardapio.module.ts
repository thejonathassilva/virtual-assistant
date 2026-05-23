import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { CardapioController } from './cardapio.controller';
import { CardapioService } from './cardapio.service';

@Module({
  imports: [ProductsModule],
  controllers: [CardapioController],
  providers: [CardapioService],
})
export class CardapioModule {}
