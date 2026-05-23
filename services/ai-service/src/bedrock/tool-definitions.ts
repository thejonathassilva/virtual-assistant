export const ASSISTANT_TOOLS = [
  {
    toolSpec: {
      name: 'consultar_cardapio',
      description:
        'Consulta o cardapio do restaurante. Pode filtrar por categoria ou restricao alimentar.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            categoria: {
              type: 'string',
              enum: [
                'entradas',
                'pratos_principais',
                'bebidas',
                'sobremesas',
                'todos',
              ],
            },
            restricao_alimentar: {
              type: 'string',
              enum: [
                'vegano',
                'vegetariano',
                'sem_gluten',
                'sem_lactose',
                'nenhuma',
              ],
            },
          },
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'adicionar_item_pedido',
      description:
        'Adiciona um item ao pedido da mesa atual. Usar quando o cliente decidir o que quer pedir.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            produto_nome: { type: 'string' },
            quantidade: { type: 'integer' },
            observacoes: { type: 'string' },
          },
          required: ['produto_nome', 'quantidade'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'remover_item_pedido',
      description:
        'Remove um item do pedido da mesa atual. Usar quando o cliente mudar de ideia antes de finalizar.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            produto_nome: { type: 'string' },
          },
          required: ['produto_nome'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'consultar_pedido_atual',
      description:
        'Mostra todos os itens que ja estao no pedido atual da mesa, com quantidades, observacoes e valor parcial.',
      inputSchema: {
        json: { type: 'object', properties: {} },
      },
    },
  },
  {
    toolSpec: {
      name: 'consultar_ingredientes',
      description:
        'Consulta os ingredientes e alergenos de um produto especifico.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            produto_nome: { type: 'string' },
          },
          required: ['produto_nome'],
        },
      },
    },
  },
  {
    toolSpec: {
      name: 'finalizar_pedido',
      description:
        'Envia o pedido atual para a cozinha. Usar SOMENTE quando o cliente confirmar explicitamente.',
      inputSchema: {
        json: { type: 'object', properties: {} },
      },
    },
  },
  {
    toolSpec: {
      name: 'chamar_garcom',
      description:
        'Solicita que um garcom va ate a mesa. Usar quando o cliente pedir ajuda humana.',
      inputSchema: {
        json: {
          type: 'object',
          properties: {
            motivo: { type: 'string' },
          },
        },
      },
    },
  },
] as const;

export type ToolName = (typeof ASSISTANT_TOOLS)[number]['toolSpec']['name'];
