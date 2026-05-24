import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  CategoriaProduto,
  Product,
} from '../products/entities/product.entity';
import { resolveRestauranteId } from '../common/tenant';
import { ProductsService } from '../products/products.service';

const CACHE_TTL_SECONDS = 300;
const cacheAllKey = (tid: string) => `cardapio:all:${tid}`;
const cacheCategoriaKey = (tid: string, cat: string) => `cardapio:categoria:${tid}:${cat}`;

@Injectable()
export class CardapioService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly redis: RedisService,
  ) {}

  async getCardapioCompleto(restauranteId?: string): Promise<Product[]> {
    const tid = resolveRestauranteId(restauranteId);
    const key = cacheAllKey(tid);
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached) as Product[];
    }
    const produtos = await this.productsService.findActive(tid);
    await this.redis.set(key, JSON.stringify(produtos), CACHE_TTL_SECONDS);
    return produtos;
  }

  async getCardapioPorCategoria(
    categoria: string,
    restauranteId?: string,
  ): Promise<Product[]> {
    if (!Object.values(CategoriaProduto).includes(categoria as CategoriaProduto)) {
      throw new BadRequestException(
        `Categoria inválida. Use: ${Object.values(CategoriaProduto).join(', ')}`,
      );
    }
    const tid = resolveRestauranteId(restauranteId);
    const cacheKey = cacheCategoriaKey(tid, categoria);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Product[];
    }
    const produtos = await this.productsService.findActiveByCategoria(
      categoria as CategoriaProduto,
      tid,
    );
    await this.redis.set(cacheKey, JSON.stringify(produtos), CACHE_TTL_SECONDS);
    return produtos;
  }
}
