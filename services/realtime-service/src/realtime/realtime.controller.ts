import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { EmitEventDto } from './dto/emit-event.dto';
import { RealtimeService } from './realtime.service';

@Controller('events')
export class RealtimeController {
  constructor(private readonly realtime: RealtimeService) {}

  @Post('novo-pedido')
  @HttpCode(HttpStatus.ACCEPTED)
  novoPedido(@Body() body: EmitEventDto) {
    this.realtime.emitNovoPedido(body);
    return { ok: true, event: 'novo-pedido' };
  }

  @Post('pedido-atualizado')
  @HttpCode(HttpStatus.ACCEPTED)
  pedidoAtualizado(@Body() body: EmitEventDto) {
    try {
      this.realtime.emitPedidoAtualizado(body);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    return { ok: true, event: 'pedido-atualizado' };
  }

  @Post('pedido-pronto')
  @HttpCode(HttpStatus.ACCEPTED)
  pedidoPronto(@Body() body: EmitEventDto) {
    try {
      this.realtime.emitPedidoPronto(body);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    return { ok: true, event: 'pedido-pronto' };
  }

  @Post('chamar-garcom')
  @HttpCode(HttpStatus.ACCEPTED)
  chamarGarcom(@Body() body: EmitEventDto) {
    this.realtime.emitChamarGarcom(body);
    return { ok: true, event: 'chamar-garcom' };
  }

  @Post('mesa-atualizada')
  @HttpCode(HttpStatus.ACCEPTED)
  mesaAtualizada(@Body() body: EmitEventDto) {
    try {
      this.realtime.emitMesaAtualizada(body);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
    return { ok: true, event: 'mesa-atualizada' };
  }
}
