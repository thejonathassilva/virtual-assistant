export const REALTIME_EVENTS = {
  NOVO_PEDIDO: 'novo-pedido',
  PEDIDO_ATUALIZADO: 'pedido-atualizado',
  PEDIDO_PRONTO: 'pedido-pronto',
  CHAMAR_GARCOM: 'chamar-garcom',
  MESA_ATUALIZADA: 'mesa-atualizada',
  RESPOSTA_ASSISTENTE: 'resposta-assistente',
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export const NAMESPACES = {
  COZINHA: '/cozinha',
  GARCOM: '/garcom',
  mesa: (mesaId: string) => `/mesa/${mesaId}`,
} as const;

export const MESA_NAMESPACE_PATTERN = /^\/mesa\/[^/]+$/;
