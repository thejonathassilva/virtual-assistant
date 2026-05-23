import { Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ItemPedidoStatus, PedidoStatus } from '../common/enums';
import { PedidosService } from '../pedidos/pedidos.service';
import { CozinhaService } from './cozinha.service';

@ApiTags('cozinha')
@Controller('cozinha')
export class CozinhaController {
  constructor(
    private readonly cozinhaService: CozinhaService,
    private readonly pedidosService: PedidosService,
  ) {}

  @Get('pedidos')
  @ApiOperation({ summary: 'Pedidos ativos na cozinha' })
  listarPedidos() {
    return this.cozinhaService.listarPedidos();
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatísticas da cozinha' })
  estatisticas() {
    return this.cozinhaService.estatisticas();
  }

  @Put('pedidos/:id/iniciar')
  @ApiOperation({ summary: 'Iniciar preparo do pedido (→ em_preparo)' })
  iniciar(@Param('id', ParseUUIDPipe) id: string) {
    return this.pedidosService.updateStatus(id, PedidoStatus.EM_PREPARO);
  }

  @Put('pedidos/:id/pronto')
  @ApiOperation({ summary: 'Marcar pedido como pronto para o garçom' })
  pronto(@Param('id', ParseUUIDPipe) id: string) {
    return this.pedidosService.updateStatus(id, PedidoStatus.PRONTO);
  }

  @Put('pedidos/:id/itens/:itemId/pronto')
  @ApiOperation({ summary: 'Marcar item individual como pronto' })
  itemPronto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.pedidosService.updateItemStatus(
      id,
      itemId,
      ItemPedidoStatus.PRONTO,
    );
  }
}
