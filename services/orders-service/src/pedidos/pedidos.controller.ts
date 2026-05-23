import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddItemPedidoDto } from './dto/add-item-pedido.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ListPedidosQueryDto } from './dto/list-pedidos-query.dto';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';
import { UpdatePedidoStatusDto } from './dto/update-pedido-status.dto';
import { PedidosService } from './pedidos.service';

@ApiTags('pedidos')
@Controller()
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post('pedidos')
  @ApiOperation({ summary: 'Criar pedido' })
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidosService.create(dto);
  }

  @Get('pedidos')
  @ApiOperation({ summary: 'Listar pedidos' })
  findAll(@Query() query: ListPedidosQueryDto) {
    return this.pedidosService.findAll(query);
  }

  @Get('pedidos/:id')
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pedidosService.findOne(id);
  }

  @Post('pedidos/:id/itens')
  @ApiOperation({ summary: 'Adicionar item ao pedido' })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddItemPedidoDto,
  ) {
    return this.pedidosService.addItem(id, dto);
  }

  @Delete('pedidos/:id/itens/:itemId')
  @ApiOperation({ summary: 'Remover item pendente do pedido' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.pedidosService.removeItem(id, itemId);
  }

  @Post('pedidos/:id/enviar-cozinha')
  @ApiOperation({
    summary: 'Enviar pedido à cozinha e notificar realtime-service',
  })
  enviarCozinha(@Param('id', ParseUUIDPipe) id: string) {
    return this.pedidosService.enviarCozinha(id);
  }

  @Put('pedidos/:id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePedidoStatusDto,
  ) {
    return this.pedidosService.updateStatus(id, dto.status);
  }

  @Put('pedidos/:id/itens/:itemId/status')
  @ApiOperation({ summary: 'Atualizar status de item do pedido' })
  updateItemStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    return this.pedidosService.updateItemStatus(id, itemId, dto.status);
  }

  @Get('mesas/:mesaId/pedido-atual')
  @ApiOperation({ summary: 'Pedido ativo da mesa' })
  pedidoAtual(@Param('mesaId', ParseUUIDPipe) mesaId: string) {
    return this.pedidosService.findPedidoAtualByMesa(mesaId);
  }
}
