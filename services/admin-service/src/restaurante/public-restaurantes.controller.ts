import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestauranteService } from './restaurante.service';

@ApiTags('public')
@Controller('public/restaurantes')
export class PublicRestaurantesController {
  constructor(private readonly restaurantes: RestauranteService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Resolver restaurante pelo slug (área do cliente)' })
  async bySlug(@Param('slug') slug: string) {
    try {
      return await this.restaurantes.findBySlug(slug);
    } catch {
      throw new NotFoundException('Restaurante não encontrado');
    }
  }
}
