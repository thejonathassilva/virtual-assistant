import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SessionsService } from '../sessions/sessions.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { MesasService } from './mesas.service';

@ApiTags('mesas')
@Controller('mesas')
export class MesasController {
  constructor(
    private readonly mesasService: MesasService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Get()
  findAll() {
    return this.mesasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe público da mesa' })
  findOne(@Param('id') id: string) {
    return this.mesasService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateMesaDto) {
    return this.mesasService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMesaDto) {
    return this.mesasService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mesasService.remove(id);
  }

  @Post(':id/abrir-sessao')
  abrirSessao(@Param('id') id: string) {
    return this.sessionsService.openSession(id);
  }

  @Get(':id/qrcode')
  @Header('Content-Type', 'image/png')
  @ApiOperation({ summary: 'QR code PNG apontando para APP_URL/mesa/{id}' })
  async qrcode(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.mesasService.generateQrCode(id);
    res.send(buffer);
  }
}
