import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestauranteService } from './restaurante.service';

/** Uso service-to-service (ai-service) na rede Docker. */
@ApiTags('internal')
@Controller('internal/restaurantes')
export class InternalRestaurantesController {
  constructor(private readonly restaurantes: RestauranteService) {}

  @Get(':id/cota')
  @ApiOperation({ summary: 'Status da cota de tokens' })
  cota(@Param('id') id: string) {
    return this.restaurantes.findById(id);
  }

  @Post(':id/tokens')
  @ApiOperation({ summary: 'Registrar consumo de tokens' })
  registrar(
    @Param('id') id: string,
    @Body() body: { tokens: number },
  ) {
    return this.restaurantes.registrarUsoTokens(id, body.tokens ?? 0);
  }
}
