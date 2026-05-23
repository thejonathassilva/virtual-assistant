import { ContentFilterStrength } from '../enums';
import { DEFAULT_SYSTEM_PROMPT } from './default-prompt';

export const DEFAULT_RESTAURANT_NAME = 'Duas Mãos, Uma Mesa';

export const DEFAULT_CONFIG_IA = {
  prompt_sistema: DEFAULT_SYSTEM_PROMPT,
  modelo_id:
    process.env.BEDROCK_MODEL_ID ??
    'anthropic.claude-3-5-sonnet-20241022-v2:0',
  temperature: 0.3,
  top_p: 0.9,
  top_k: 50,
  max_tokens: 1024,
  stop_sequences: [] as string[],
  knowledge_base_id: process.env.BEDROCK_KNOWLEDGE_BASE_ID ?? '',
  kb_max_results: 5,
  kb_score_threshold: 0.5,
  guardrail_id: process.env.BEDROCK_GUARDRAIL_ID ?? '',
  guardrail_version: process.env.BEDROCK_GUARDRAIL_VERSION ?? '1',
  content_filter_strength: ContentFilterStrength.MEDIUM,
  grounding_threshold: 0.7,
  relevance_threshold: 0.7,
  temas_bloqueados: [
    'politica',
    'religiao',
    'concorrentes',
    'conteudo adulto',
    'financeiro',
    'medico',
  ],
  palavras_bloqueadas: [] as string[],
};
