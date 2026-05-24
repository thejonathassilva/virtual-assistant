export type UserRole =
  | 'platform_owner'
  | 'admin'
  | 'cozinha'
  | 'garcom'
  | 'caixa';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  restaurante_id?: string | null;
}

export interface RestauranteTenant {
  id: string;
  slug: string;
  nome: string;
  ativo: boolean;
  token_quota_mensal: number | null;
  tokens_usados_mes: number;
  quota_ilimitada: boolean;
  quota_renovacao_em: string;
  tokens_quota_efetiva: number;
  percentual_uso: number;
  custo_estimado_brl: number;
  renovacao_em: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: string | number;
  categoria: string;
  ingredientes: string[];
  alergenos: string[];
  tags: string[];
  foto_url?: string;
  tempo_preparo_minutos?: number;
  ativo: boolean;
}

export interface Mesa {
  id: string;
  numero: number;
  status: string;
  restaurante_id?: string;
  sessao_ativa_id?: string | null;
  qr_code_url?: string;
}

export interface ItemPedido {
  id: string;
  produto_id: string;
  quantidade: number;
  observacoes?: string | null;
  preco_unitario: string | number;
  status: string;
}

export interface Pedido {
  id: string;
  mesa_id: string;
  sessao_id: string;
  status: string;
  origem: string;
  valor_total: string | number;
  itens: ItemPedido[];
  created_at?: string;
}

export interface ChatHistoricoMsg {
  role: string;
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  resposta: string;
  sessao_id?: string;
  mesa_id?: string;
  tool_calls?: unknown[];
  metrics?: { latency_ms?: number };
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  restaurante_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  missao?: string;
  visao?: string;
  valores?: string;
  endereco?: string;
  telefone?: string;
  logo_url?: string | null;
}
