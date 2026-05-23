import { Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CaixaService } from './caixa.service';

@ApiTags('caixa')
@Controller('caixa')
export class CaixaController {
  constructor(private readonly caixaService: CaixaService) {}

  @Get('mesas-abertas')
  @ApiOperation({ summary: 'Mesas com conta em aberto' })
  mesasAbertas() {
    return this.caixaService.listarMesasAbertas();
  }

  @Get('mesas/:id/conta')
  @ApiOperation({ summary: 'Conta detalhada da mesa' })
  conta(@Param('id', ParseUUIDPipe) id: string) {
    return this.caixaService.obterContaMesa(id);
  }

  @Put('pedidos/:id/fechar')
  @ApiOperation({
    summary: 'Fechar pedido (pagamento) e encerrar sessão no tables-service',
  })
  fechar(@Param('id', ParseUUIDPipe) id: string) {
    return this.caixaService.fecharPedido(id);
  }
}
