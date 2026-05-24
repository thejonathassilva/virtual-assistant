import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedMesasDto } from './dto/seed-mesas.dto';
import { MesasService } from './mesas.service';

@ApiTags('internal')
@Controller('internal/mesas')
export class InternalMesasController {
  constructor(private readonly mesas: MesasService) {}

  @Post('seed/:restauranteId')
  @ApiOperation({ summary: 'Criar mesas iniciais para um tenant (onboarding)' })
  seed(
    @Param('restauranteId') restauranteId: string,
    @Body() body: SeedMesasDto,
  ) {
    return this.mesas.seedMesasForTenant(
      restauranteId,
      body.quantidade ?? 5,
      body.restaurante_slug,
    );
  }
}
