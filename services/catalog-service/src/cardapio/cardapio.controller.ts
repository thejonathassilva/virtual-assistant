import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CategoriaProduto } from '../products/entities/product.entity';
import { CardapioService } from './cardapio.service';

@ApiTags('cardapio')
@Controller('cardapio')
export class CardapioController {
  constructor(private readonly cardapioService: CardapioService) {}

  @Get()
  @ApiOperation({ summary: 'Cardápio público (apenas produtos ativos)' })
  getCardapio() {
    return this.cardapioService.getCardapioCompleto();
  }

  @Get(':categoria')
  @ApiOperation({ summary: 'Cardápio por categoria (apenas produtos ativos)' })
  @ApiParam({ name: 'categoria', enum: CategoriaProduto })
  getCardapioPorCategoria(@Param('categoria') categoria: string) {
    return this.cardapioService.getCardapioPorCategoria(categoria);
  }
}
