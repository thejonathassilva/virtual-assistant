import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRestauranteDto } from './dto/create-restaurante.dto';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { RestauranteService } from './restaurante.service';

@ApiTags('platform')
@Controller('platform/restaurantes')
export class PlatformRestaurantesController {
  constructor(private readonly restaurantes: RestauranteService) {}

  private assertPlatform(role?: string) {
    if (role !== 'platform_owner') {
      throw new ForbiddenException('Acesso restrito ao administrador da plataforma');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes (platform owner)' })
  list(@Headers('x-user-role') role?: string) {
    this.assertPlatform(role);
    return this.restaurantes.findAll();
  }

  @Get(':id/admin')
  @ApiOperation({ summary: 'Administrador principal do restaurante' })
  getAdmin(@Headers('x-user-role') role: string, @Param('id') id: string) {
    this.assertPlatform(role);
    return this.restaurantes.findAdminUsuario(id, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do restaurante' })
  get(@Headers('x-user-role') role: string, @Param('id') id: string) {
    this.assertPlatform(role);
    return this.restaurantes.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar restaurante' })
  create(@Headers('x-user-role') role: string, @Body() dto: CreateRestauranteDto) {
    this.assertPlatform(role);
    return this.restaurantes.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar restaurante / cota' })
  update(
    @Headers('x-user-role') role: string,
    @Param('id') id: string,
    @Body() dto: UpdateRestauranteDto,
  ) {
    this.assertPlatform(role);
    return this.restaurantes.update(id, dto);
  }
}
