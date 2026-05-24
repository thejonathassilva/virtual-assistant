import { Controller, Get, Headers, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriaProduto } from '../products/entities/product.entity';
import { CardapioService } from './cardapio.service';

@ApiTags('cardapio')
@Controller('cardapio')
export class CardapioController {
  constructor(private readonly cardapioService: CardapioService) {}

  @Get()
  @ApiOperation({ summary: 'Cardápio público (apenas produtos ativos)' })
  getCardapio(@Headers('x-restaurante-id') restauranteId?: string) {
    return this.cardapioService.getCardapioCompleto(restauranteId);
  }

  @Get(':categoria')
  @ApiOperation({ summary: 'Cardápio por categoria (apenas produtos ativos)' })
  @ApiParam({ name: 'categoria', enum: CategoriaProduto })
  getCardapioPorCategoria(
    @Param('categoria') categoria: string,
    @Headers('x-restaurante-id') restauranteId?: string,
  ) {
    return this.cardapioService.getCardapioPorCategoria(categoria, restauranteId);
  }
}
