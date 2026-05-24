import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BedrockResponse } from '../bedrock/bedrock.service';
import { resolveRestauranteId } from '../common/tenant';
import { ConfigIa } from '../entities/config-ia.entity';
import { MetricaIaDiaria } from '../entities/metrica-ia-diaria.entity';
import { QuotaService } from '../quota/quota.service';
import { MesaSession } from '../session/session.types';

@Injectable()
export class MetricasService {
  constructor(
    @InjectRepository(MetricaIaDiaria)
    private readonly metricaRepo: Repository<MetricaIaDiaria>,
    private readonly quota: QuotaService,
  ) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private async getOrCreateToday(restauranteId: string): Promise<MetricaIaDiaria> {
    const data = this.today();
    let metrica = await this.metricaRepo.findOne({
      where: { data, restaurante_id: restauranteId },
    });
    if (!metrica) {
      metrica = this.metricaRepo.create({ data, restaurante_id: restauranteId });
      metrica = await this.metricaRepo.save(metrica);
    }
    return metrica;
  }

  async recordMessageMetrics(
    config: ConfigIa,
    response: BedrockResponse,
    restauranteId?: string,
  ): Promise<void> {
    const tid = resolveRestauranteId(restauranteId);
    const totalTokens = response.inputTokens + response.outputTokens;
    await this.quota.registrarTokens(tid, totalTokens);

    const metrica = await this.getOrCreateToday(tid);
    metrica.tokens_consumidos_input += response.inputTokens;
    metrica.tokens_consumidos_output += response.outputTokens;
    metrica.custo_estimado_usd += this.estimateCost(
      response.inputTokens,
      response.outputTokens,
    );
    if (response.guardrailBlocked) {
      metrica.guardrails_acionados += 1;
    }
    metrica.modelo_mais_usado = config.modelo_id;

    const n = metrica.total_conversas || 1;
    metrica.latencia_media_ms =
      (metrica.latencia_media_ms * (n - 1) + response.latencyMs) / n;

    if (response.toolCalls.length > 0) {
      metrica.tool_mais_chamada = response.toolCalls[0].name;
    }

    await this.metricaRepo.save(metrica);
  }

  async recordSessionEnd(
    session: MesaSession,
    config: ConfigIa,
    restauranteId?: string,
  ): Promise<void> {
    const tid = resolveRestauranteId(restauranteId);
    const metrica = await this.getOrCreateToday(tid);
    metrica.total_conversas += 1;

    if (session.pedido_finalizado) {
      metrica.pedidos_completados_ia += 1;
    }
    if (session.fallback_garcom) {
      metrica.fallbacks_garcom += 1;
    }

    const duracao =
      (Date.now() - new Date(session.started_at).getTime()) / 1000;
    const n = metrica.total_conversas;
    metrica.tempo_medio_conversa_segundos =
      (metrica.tempo_medio_conversa_segundos * (n - 1) + duracao) / n;

    const extraIn = session.total_tokens_input;
    const extraOut = session.total_tokens_output;
    await this.quota.registrarTokens(tid, extraIn + extraOut);

    metrica.tokens_consumidos_input += extraIn;
    metrica.tokens_consumidos_output += extraOut;
    metrica.custo_estimado_usd += this.estimateCost(extraIn, extraOut);
    metrica.guardrails_acionados += session.guardrails_acionados;
    metrica.modelo_mais_usado = config.modelo_id;

    await this.metricaRepo.save(metrica);
  }

  async getMetricas(periodo?: string, restauranteId?: string) {
    const tid = resolveRestauranteId(restauranteId);

    if (periodo === 'hoje' || !periodo) {
      const hoje = await this.getOrCreateToday(tid);
      return { periodo: 'hoje', metricas: [hoje], restaurante_id: tid };
    }

    const metricas = await this.metricaRepo.find({
      where: { restaurante_id: tid },
      order: { data: 'DESC' },
      take: periodo === 'semana' ? 7 : periodo === 'mes' ? 30 : 90,
    });

    return { periodo, metricas, restaurante_id: tid };
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    return inputTokens * 0.000003 + outputTokens * 0.000015;
  }
}
