import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestauranteService } from './restaurante.service';

/** Uso service-to-service (ai-service) na rede Docker. */
@ApiTags('internal')
@Controller('internal/restaurantes')
export class InternalRestaurantesController {
  constructor(private readonly restaurantes: RestauranteService) {}

  @Post('renovar-cotas')
  @ApiOperation({
    summary: 'Forçar renovação de cotas vencidas (todos os restaurantes)',
  })
  renovarCotas() {
    return this.restaurantes.renovarCotasVencidas().then((renovados) => ({
      renovados,
      mensagem:
        renovados > 0
          ? `${renovados} restaurante(s) com cota zerada e nova data de renovação`
          : 'Nenhuma cota vencida no momento',
    }));
  }

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
