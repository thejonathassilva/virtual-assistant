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

  private periodoDias(periodo?: string): number {
    if (periodo === 'mes') return 30;
    if (periodo === 'semana') return 7;
    return 1;
  }

  private diasAtras(dias: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (dias - 1));
    return d.toISOString().slice(0, 10);
  }

  private listaDatasUtc(dias: number): string[] {
    const out: string[] = [];
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (dias - 1));
    for (let i = 0; i < dias; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }

  private emptyMetrica(data: string, restauranteId: string): MetricaIaDiaria {
    return {
      id: '',
      data,
      restaurante_id: restauranteId,
      total_conversas: 0,
      pedidos_completados_ia: 0,
      fallbacks_garcom: 0,
      tempo_medio_conversa_segundos: 0,
      latencia_media_ms: 0,
      tokens_consumidos_input: 0,
      tokens_consumidos_output: 0,
      guardrails_acionados: 0,
      custo_estimado_usd: 0,
    } as MetricaIaDiaria;
  }

  private preencherDias(
    metricas: MetricaIaDiaria[],
    dias: number,
    restauranteId: string,
  ): MetricaIaDiaria[] {
    const byDate = new Map(metricas.map((m) => [m.data, m]));
    return this.listaDatasUtc(dias).map(
      (data) => byDate.get(data) ?? this.emptyMetrica(data, restauranteId),
    );
  }

  private resumoMetricas(metricas: MetricaIaDiaria[]) {
    const USD_TO_BRL = 6;
    const tokensIn = metricas.reduce((s, m) => s + m.tokens_consumidos_input, 0);
    const tokensOut = metricas.reduce((s, m) => s + m.tokens_consumidos_output, 0);
    const custoUsd = metricas.reduce((s, m) => s + Number(m.custo_estimado_usd), 0);
    return {
      total_conversas: metricas.reduce((s, m) => s + m.total_conversas, 0),
      pedidos_completados_ia: metricas.reduce(
        (s, m) => s + m.pedidos_completados_ia,
        0,
      ),
      fallbacks_garcom: metricas.reduce((s, m) => s + m.fallbacks_garcom, 0),
      tokens_total: tokensIn + tokensOut,
      custo_estimado_brl: Number((custoUsd * USD_TO_BRL).toFixed(2)),
    };
  }

  /** Métricas dos últimos N dias por tenant (painel plataforma). */
  async getMetricasPlatform(periodo = 'semana', restauranteId?: string) {
    const dias = this.periodoDias(periodo);
    const since = this.diasAtras(dias);

    const qb = this.metricaRepo
      .createQueryBuilder('m')
      .where('m.data >= :since', { since });
    if (restauranteId?.trim()) {
      qb.andWhere('m.restaurante_id = :tid', { tid: restauranteId.trim() });
    }
    qb.orderBy('m.data', 'ASC');
    const rows = await qb.getMany();

    const byTenant = new Map<string, MetricaIaDiaria[]>();
    for (const row of rows) {
      const list = byTenant.get(row.restaurante_id) ?? [];
      list.push(row);
      byTenant.set(row.restaurante_id, list);
    }

    if (restauranteId?.trim() && !byTenant.has(restauranteId.trim())) {
      byTenant.set(restauranteId.trim(), []);
    }

    const tenants = Array.from(byTenant.entries()).map(([tid, metricas]) => {
      const filled = this.preencherDias(metricas, dias, tid);
      return {
        restaurante_id: tid,
        periodo,
        metricas: filled,
        resumo: this.resumoMetricas(filled),
      };
    });

    tenants.sort((a, b) => a.restaurante_id.localeCompare(b.restaurante_id));

    const totais = {
      total_conversas: tenants.reduce((s, t) => s + t.resumo.total_conversas, 0),
      tokens_total: tenants.reduce((s, t) => s + t.resumo.tokens_total, 0),
      custo_estimado_brl: tenants.reduce(
        (s, t) => s + t.resumo.custo_estimado_brl,
        0,
      ),
    };

    return { periodo, tenants, totais };
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    return inputTokens * 0.000003 + outputTokens * 0.000015;
  }
}
