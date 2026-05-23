import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_CONFIG_IA } from '../common/constants/default-config';
import { ConfigIa } from '../entities/config-ia.entity';
import { BedrockService } from '../bedrock/bedrock.service';
import { SessionService } from '../session/session.service';
import { TesteConfigDto } from './dto/teste-config.dto';
import { UpdateConfigIaDto } from './dto/update-config-ia.dto';

const TEST_MESA_ID = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class ConfigIaService implements OnModuleInit {
  constructor(
    @InjectRepository(ConfigIa)
    private readonly configRepo: Repository<ConfigIa>,
    private readonly bedrock: BedrockService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.configRepo.count();
    if (count === 0) {
      await this.configRepo.save(
        this.configRepo.create({ ...DEFAULT_CONFIG_IA }),
      );
    }
  }

  async getConfig(): Promise<ConfigIa> {
    const configs = await this.configRepo.find({ order: { updated_at: 'DESC' } });
    if (!configs.length) {
      return this.configRepo.save(
        this.configRepo.create({ ...DEFAULT_CONFIG_IA }),
      );
    }
    return configs[0];
  }

  async updateConfig(dto: UpdateConfigIaDto): Promise<ConfigIa> {
    const current = await this.getConfig();
    Object.assign(current, dto);
    return this.configRepo.save(current);
  }

  async resetConfig(): Promise<ConfigIa> {
    const current = await this.getConfig();
    Object.assign(current, DEFAULT_CONFIG_IA);
    return this.configRepo.save(current);
  }

  async testConfig(dto: TesteConfigDto) {
    const config = await this.getConfig();
    const mesaId = dto.mesa_id ?? TEST_MESA_ID;
    const session = await this.sessionService.getOrCreate(mesaId);

    const response = await this.bedrock.converse(dto.mensagem, session, config);

    return {
      mesa_id: mesaId,
      sessao_id: session.sessao_id,
      resposta: response.text,
      tool_calls: response.toolCalls,
      config_usada: {
        modelo_id: config.modelo_id,
        temperature: config.temperature,
        top_p: config.top_p,
        top_k: config.top_k,
        max_tokens: config.max_tokens,
      },
      metrics: {
        latency_ms: response.latencyMs,
        input_tokens: response.inputTokens,
        output_tokens: response.outputTokens,
        guardrail_blocked: response.guardrailBlocked,
      },
      modo: process.env.BEDROCK_MOCK === 'false' ? 'bedrock' : 'mock',
    };
  }
}
