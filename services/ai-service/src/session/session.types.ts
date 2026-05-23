import { ChatMessageRole } from '../common/enums';

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  timestamp: string;
  toolUse?: { name: string; input: Record<string, unknown> };
  toolResult?: { status: string; content: unknown };
  metrics?: {
    latencyMs?: number;
    inputTokens?: number;
    outputTokens?: number;
  };
}

export interface MesaSession {
  sessao_id: string;
  mesa_id: string;
  messages: ChatMessage[];
  started_at: string;
  total_tool_calls: number;
  total_tokens_input: number;
  total_tokens_output: number;
  latencies_ms: number[];
  guardrails_acionados: number;
  fallback_garcom: boolean;
  pedido_finalizado: boolean;
}
