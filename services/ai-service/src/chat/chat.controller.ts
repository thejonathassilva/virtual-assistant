import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { EnviarMensagemDto } from './dto/enviar-mensagem.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post(':mesaId/mensagem')
  @ApiOperation({ summary: 'Enviar mensagem ao assistente virtual' })
  enviarMensagem(
    @Param('mesaId', ParseUUIDPipe) mesaId: string,
    @Body() dto: EnviarMensagemDto,
  ) {
    return this.chatService.enviarMensagem(mesaId, dto);
  }

  @Post(':mesaId/mensagem/stream')
  @ApiOperation({ summary: 'Enviar mensagem com resposta em streaming (SSE)' })
  async enviarMensagemStream(
    @Param('mesaId', ParseUUIDPipe) mesaId: string,
    @Body() dto: EnviarMensagemDto,
    @Res() res: Response,
  ) {
    await this.chatService.enviarMensagemStream(mesaId, dto, res);
  }

  @Get(':mesaId/historico')
  @ApiOperation({ summary: 'Historico da sessao atual da mesa' })
  getHistorico(@Param('mesaId', ParseUUIDPipe) mesaId: string) {
    return this.chatService.getHistorico(mesaId);
  }

  @Delete(':mesaId/sessao')
  @ApiOperation({
    summary: 'Limpar sessao de chat (chamado ao fechar conta)',
  })
  limparSessao(@Param('mesaId', ParseUUIDPipe) mesaId: string) {
    return this.chatService.limparSessao(mesaId);
  }
}
