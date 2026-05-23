import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../redis/redis.service';
import { ChatMessage, MesaSession } from './session.types';

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas

@Injectable()
export class SessionService {
  constructor(private readonly redis: RedisService) {}

  private sessionKey(mesaId: string): string {
    return `chat:mesa:${mesaId}`;
  }

  async getOrCreate(mesaId: string): Promise<MesaSession> {
    const existing = await this.get(mesaId);
    if (existing) {
      return existing;
    }

    const session: MesaSession = {
      sessao_id: uuidv4(),
      mesa_id: mesaId,
      messages: [],
      started_at: new Date().toISOString(),
      total_tool_calls: 0,
      total_tokens_input: 0,
      total_tokens_output: 0,
      latencies_ms: [],
      guardrails_acionados: 0,
      fallback_garcom: false,
      pedido_finalizado: false,
    };

    await this.save(session);
    return session;
  }

  async get(mesaId: string): Promise<MesaSession | null> {
    const raw = await this.redis.get(this.sessionKey(mesaId));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as MesaSession;
  }

  async save(session: MesaSession): Promise<void> {
    await this.redis.set(
      this.sessionKey(session.mesa_id),
      JSON.stringify(session),
      SESSION_TTL_SECONDS,
    );
  }

  async appendMessage(mesaId: string, message: ChatMessage): Promise<MesaSession> {
    const session = await this.getOrCreate(mesaId);
    session.messages.push(message);
    await this.save(session);
    return session;
  }

  async clear(mesaId: string): Promise<MesaSession | null> {
    const session = await this.get(mesaId);
    await this.redis.del(this.sessionKey(mesaId));
    return session;
  }
}
