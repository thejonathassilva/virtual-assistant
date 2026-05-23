import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import {
  CategoriaProduto,
  Product,
} from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';

const CACHE_TTL_SECONDS = 300;
const CACHE_ALL_KEY = 'cardapio:all';
const CACHE_CATEGORIA_PREFIX = 'cardapio:categoria:';

@Injectable()
export class CardapioService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly redis: RedisService,
  ) {}

  async getCardapioCompleto(): Promise<Product[]> {
    const cached = await this.redis.get(CACHE_ALL_KEY);
    if (cached) {
      return JSON.parse(cached) as Product[];
    }
    const produtos = await this.productsService.findActive();
    await this.redis.set(
      CACHE_ALL_KEY,
      JSON.stringify(produtos),
      CACHE_TTL_SECONDS,
    );
    return produtos;
  }

  async getCardapioPorCategoria(categoria: string): Promise<Product[]> {
    if (!Object.values(CategoriaProduto).includes(categoria as CategoriaProduto)) {
      throw new BadRequestException(
        `Categoria inválida. Use: ${Object.values(CategoriaProduto).join(', ')}`,
      );
    }
    const cacheKey = `${CACHE_CATEGORIA_PREFIX}${categoria}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Product[];
    }
    const produtos = await this.productsService.findActiveByCategoria(
      categoria as CategoriaProduto,
    );
    await this.redis.set(
      cacheKey,
      JSON.stringify(produtos),
      CACHE_TTL_SECONDS,
    );
    return produtos;
  }
}
