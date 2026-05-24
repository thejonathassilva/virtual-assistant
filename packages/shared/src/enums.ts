export enum UserRole {
  PLATFORM_OWNER = 'platform_owner',
  ADMIN = 'admin',
  COZINHA = 'cozinha',
  GARCOM = 'garcom',
  CAIXA = 'caixa',
}

export enum CategoriaProduto {
  ENTRADAS = 'entradas',
  PRATOS_PRINCIPAIS = 'pratos_principais',
  BEBIDAS = 'bebidas',
  SOBREMESAS = 'sobremesas',
}

export enum MesaStatus {
  LIVRE = 'livre',
  OCUPADA = 'ocupada',
  AGUARDANDO_PAGAMENTO = 'aguardando_pagamento',
}

export enum SessaoStatus {
  ATIVA = 'ativa',
  ENCERRADA = 'encerrada',
}

export enum PedidoStatus {
  ABERTO = 'aberto',
  ENVIADO_COZINHA = 'enviado_cozinha',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  PAGO = 'pago',
  CANCELADO = 'cancelado',
}

export enum ItemPedidoStatus {
  PENDENTE = 'pendente',
  EM_PREPARO = 'em_preparo',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
}

export enum PedidoOrigem {
  ASSISTENTE_VIRTUAL = 'assistente_virtual',
  GARCOM = 'garcom',
  CAIXA = 'caixa',
}

export enum ContentFilterStrength {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
