import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BedrockService } from '../bedrock/bedrock.service';
import { ChatMessageRole } from '../common/enums';
import { ConfigIa } from '../entities/config-ia.entity';
import { LogConversa } from '../entities/log-conversa.entity';
import { ConfigIaService } from '../config-ia/config-ia.service';
import { MetricasService } from '../metricas/metricas.service';
import { TablesClient } from '../clients/tables.client';
import { QuotaService } from '../quota/quota.service';
import { SessionService } from '../session/session.service';
import { ChatMessage } from '../session/session.types';
import { EnviarMensagemDto } from './dto/enviar-mensagem.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly bedrock: BedrockService,
    private readonly configIaService: ConfigIaService,
    private readonly metricas: MetricasService,
    private readonly quota: QuotaService,
    private readonly tables: TablesClient,
    @InjectRepository(LogConversa)
    private readonly logRepo: Repository<LogConversa>,
  ) {}

  async enviarMensagem(mesaId: string, dto: EnviarMensagemDto) {
    const config = await this.configIaService.getConfig();
    const session = await this.sessionService.getOrCreate(mesaId);

    if (dto.sessao_id) {
      session.sessao_id = dto.sessao_id;
    }

    const userMsg: ChatMessage = {
      role: ChatMessageRole.USER,
      content: dto.mensagem,
      timestamp: new Date().toISOString(),
    };
    await this.sessionService.appendMessage(mesaId, userMsg);

    const updatedSession = (await this.sessionService.get(mesaId))!;
    const restauranteId = await this.tables.resolveRestauranteId(mesaId);

    try {
      await this.quota.assertCanConsume(restauranteId);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Limite de uso da IA atingido neste mês';
      return {
        sessao_id: updatedSession.sessao_id,
        mesa_id: mesaId,
        resposta: `${msg}. Chame o garçom para continuar seu atendimento.`,
        tool_calls: [],
        metrics: { latency_ms: 0, input_tokens: 0, output_tokens: 0, guardrail_blocked: false },
      };
    }

    const response = await this.bedrock.converse(
      dto.mensagem,
      updatedSession,
      config,
      { restauranteId },
    );

    if (response.guardrailBlocked) {
      updatedSession.guardrails_acionados += 1;
    }

    for (const tool of response.toolCalls) {
      const toolMsg: ChatMessage = {
        role: ChatMessageRole.TOOL_USE,
        content: `Executou ${tool.name}`,
        timestamp: new Date().toISOString(),
        toolUse: { name: tool.name, input: tool.input },
      };
      updatedSession.messages.push(toolMsg);
      updatedSession.total_tool_calls += 1;
    }

    const assistantMsg: ChatMessage = {
      role: ChatMessageRole.ASSISTANT,
      content: response.text,
      timestamp: new Date().toISOString(),
      metrics: {
        latencyMs: response.latencyMs,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
      },
    };
    updatedSession.messages.push(assistantMsg);
    updatedSession.total_tokens_input += response.inputTokens;
    updatedSession.total_tokens_output += response.outputTokens;
    updatedSession.latencies_ms.push(response.latencyMs);

    await this.sessionService.save(updatedSession);

    await this.metricas.recordMessageMetrics(config, response, restauranteId);

    return {
      sessao_id: updatedSession.sessao_id,
      mesa_id: mesaId,
      resposta: response.text,
      tool_calls: response.toolCalls,
      metrics: {
        latency_ms: response.latencyMs,
        input_tokens: response.inputTokens,
        output_tokens: response.outputTokens,
        guardrail_blocked: response.guardrailBlocked,
      },
    };
  }

  async enviarMensagemStream(
    mesaId: string,
    dto: EnviarMensagemDto,
    res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    try {
      const result = await this.enviarMensagem(mesaId, dto);
      const text = result.resposta;
      const parts = text.match(/\S+\s*|\s+/g) ?? [text];

      for (const part of parts) {
        res.write(`data: ${JSON.stringify({ chunk: part })}\n\n`);
        await new Promise((r) => setTimeout(r, 25));
      }

      res.write(`data: ${JSON.stringify({ done: true, ...result })}\n\n`);
      res.end();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao processar mensagem';
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }

  async getHistorico(mesaId: string) {
    const session = await this.sessionService.get(mesaId);
    if (!session) {
      return {
        mesa_id: mesaId,
        sessao_id: null,
        mensagens: [],
      };
    }
    return {
      mesa_id: mesaId,
      sessao_id: session.sessao_id,
      mensagens: session.messages,
      started_at: session.started_at,
    };
  }

  async limparSessao(mesaId: string) {
    const session = await this.sessionService.clear(mesaId);
    if (!session) {
      return { mesa_id: mesaId, limpo: true, mensagem: 'Nenhuma sessao ativa' };
    }

    const duracaoSegundos =
      (Date.now() - new Date(session.started_at).getTime()) / 1000;
    const latenciaMedia =
      session.latencies_ms.length > 0
        ? session.latencies_ms.reduce((a, b) => a + b, 0) /
          session.latencies_ms.length
        : 0;

    const log = this.logRepo.create({
      sessao_id: session.sessao_id,
      mesa_id: session.mesa_id,
      mensagens: session.messages as unknown as Record<string, unknown>[],
      pedido_finalizado: session.pedido_finalizado,
      fallback_garcom: session.fallback_garcom,
      total_mensagens: session.messages.length,
      total_tool_calls: session.total_tool_calls,
      total_tokens_input: session.total_tokens_input,
      total_tokens_output: session.total_tokens_output,
      latencia_media_ms: latenciaMedia,
      guardrails_acionados: session.guardrails_acionados,
      custo_estimado_usd: this.estimateCost(
        session.total_tokens_input,
        session.total_tokens_output,
      ),
      duracao_segundos: duracaoSegundos,
    });
    await this.logRepo.save(log);

    const config = await this.configIaService.getConfig();
    const restauranteId = await this.tables.resolveRestauranteId(mesaId);
    await this.metricas.recordSessionEnd(session, config, restauranteId);

    return {
      mesa_id: mesaId,
      limpo: true,
      log_id: log.id,
    };
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    return inputTokens * 0.000003 + outputTokens * 0.000015;
  }
}
