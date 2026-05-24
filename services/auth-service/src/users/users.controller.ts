import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UserRole } from './entities/usuario.entity';
import { UsersService } from './users.service';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Headers('x-user-role') role?: string,
    @Headers('x-restaurante-id') restauranteId?: string,
  ) {
    if (role === UserRole.PLATFORM_OWNER) {
      return this.usersService.findAll();
    }
    return this.usersService.findAll(restauranteId || undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  create(
    @Headers('x-user-role') role?: string,
    @Headers('x-restaurante-id') restauranteId?: string,
    @Body() dto: CreateUsuarioDto,
  ) {
    if (role === UserRole.PLATFORM_OWNER) {
      if (dto.role === UserRole.PLATFORM_OWNER) {
        throw new ForbiddenException('Não é permitido criar platform_owner pela API');
      }
      return this.usersService.create(dto);
    }
    if (!restauranteId) {
      throw new ForbiddenException('Tenant do restaurante não identificado');
    }
    if (dto.role === UserRole.PLATFORM_OWNER) {
      throw new ForbiddenException('Perfil não permitido');
    }
    dto.restaurante_id = restauranteId;
    return this.usersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
