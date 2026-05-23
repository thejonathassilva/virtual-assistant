export enum PedidoStatus {
  ABERTO = 'aberto',
  ENVIADO_COZINHA = 'enviado_cozinha',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  PAGO = 'pago',
  CANCELADO = 'cancelado',
}

export enum PedidoOrigem {
  ASSISTENTE_VIRTUAL = 'assistente_virtual',
  GARCOM = 'garcom',
  CAIXA = 'caixa',
}

export enum ItemPedidoStatus {
  PENDENTE = 'pendente',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}
