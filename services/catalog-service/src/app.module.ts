import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardapioModule } from './cardapio/cardapio.module';
import { buildTypeOrmOptions } from './database/typeorm-options';
import { HealthController } from './health.controller';
import { Product } from './products/entities/product.entity';
import { MediaModule } from './media/media.module';
import { ProductsModule } from './products/products.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildTypeOrmOptions([Product])),
    RedisModule,
    MediaModule,
    ProductsModule,
    CardapioModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
