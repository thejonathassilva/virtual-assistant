import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { MediaModule } from '../media/media.module';
import { InternalProductsController } from './internal-products.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), MediaModule],
  controllers: [ProductsController, InternalProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
