import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MediaService } from '../media/media.service';
import { RedisService } from '../redis/redis.service';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  const repo = {
    findOne: jest.fn(),
    count: jest.fn(),
  };
  const redis = { del: jest.fn() };
  const media = { removeProductFiles: jest.fn() };

  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(
      repo as unknown as Repository<Product>,
      redis as unknown as RedisService,
      media as unknown as MediaService,
    );
  });

  it('findById lança NotFoundException quando produto nao existe', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findById('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
