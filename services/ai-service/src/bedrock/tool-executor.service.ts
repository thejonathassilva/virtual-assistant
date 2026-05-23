import { Injectable, Logger } from '@nestjs/common';
import { CatalogClient, ProdutoCatalogo } from '../clients/catalog.client';
import { OrdersClient } from '../clients/orders.client';
import { RealtimeClient } from '../clients/realtime.client';
import { ToolName } from './tool-definitions';

interface PedidoComItens {
  id: string;
  mesa_id: string;
  sessao_id?: string;
  valor_total?: string;
  itens?: Array<{
    id: string;
    produto_id: string;
    quantidade: number;
    observacoes?: string | null;
    preco_unitario: string;
    status: string;
  }>;
}

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(
    private readonly orders: OrdersClient,
    private readonly catalog: CatalogClient,
    private readonly realtime: RealtimeClient,
  ) {}

  async execute(
    toolName: ToolName,
    input: Record<string, unknown>,
    context: { mesaId: string; sessaoId: string },
  ): Promise<{ status: string; content: unknown }> {
    try {
      const content = await this.runTool(toolName, input, context);
      return { status: 'success', content };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao executar ferramenta';
      this.logger.warn(`Tool ${toolName} falhou: ${message}`);
      return { status: 'error', content: { message } };
    }
  }

  private async runTool(
    toolName: ToolName,
    input: Record<string, unknown>,
    context: { mesaId: string; sessaoId: string },
  ): Promise<unknown> {
    switch (toolName) {
      case 'consultar_cardapio':
        return this.consultarCardapio(input);
      case 'adicionar_item_pedido':
        return this.adicionarItemPedido(input, context);
      case 'remover_item_pedido':
        return this.removerItemPedido(input, context);
      case 'consultar_pedido_atual':
        return this.consultarPedidoAtual(context.mesaId);
      case 'consultar_ingredientes':
        return this.consultarIngredientes(input);
      case 'finalizar_pedido':
        return this.finalizarPedido(context.mesaId);
      case 'chamar_garcom':
        return this.chamarGarcom(input, context);
      default:
        throw new Error(`Ferramenta desconhecida: ${toolName}`);
    }
  }

  private async consultarCardapio(
    input: Record<string, unknown>,
  ): Promise<unknown> {
    const categoria = String(input.categoria ?? 'todos');
    const restricao = String(input.restricao_alimentar ?? 'nenhuma');

    let cardapio: unknown;
    if (categoria === 'todos') {
      cardapio = await this.catalog.getCardapio();
    } else {
      cardapio = await this.catalog.getCardapioPorCategoria(categoria);
    }

    if (restricao === 'nenhuma') {
      return cardapio;
    }

    const tagMap: Record<string, string> = {
      vegano: 'vegano',
      vegetariano: 'vegetariano',
      sem_gluten: 'sem_gluten',
      sem_lactose: 'sem_lactose',
    };
    const tag = tagMap[restricao];
    if (!tag) {
      return cardapio;
    }

    const filterByTag = (items: ProdutoCatalogo[]) =>
      items.filter((p) => p.tags?.includes(tag));

    if (Array.isArray(cardapio)) {
      return filterByTag(cardapio as ProdutoCatalogo[]);
    }

    if (cardapio && typeof cardapio === 'object') {
      const grouped = cardapio as Record<string, ProdutoCatalogo[]>;
      const filtered: Record<string, ProdutoCatalogo[]> = {};
      for (const [key, items] of Object.entries(grouped)) {
        if (Array.isArray(items)) {
          filtered[key] = filterByTag(items);
        }
      }
      return filtered;
    }

    return cardapio;
  }

  private async adicionarItemPedido(
    input: Record<string, unknown>,
    context: { mesaId: string; sessaoId: string },
  ): Promise<unknown> {
    const produtoNome = String(input.produto_nome ?? '');
    const quantidade = Number(input.quantidade ?? 1);
    const observacoes = input.observacoes
      ? String(input.observacoes)
      : undefined;

    const produto = await this.catalog.findProdutoByNome(produtoNome);
    if (!produto) {
      throw new Error(`Produto "${produtoNome}" nao encontrado no cardapio`);
    }

    let pedido = (await this.orders.safeGetPedidoAtual(
      context.mesaId,
    )) as PedidoComItens | null;

    if (!pedido) {
      pedido = (await this.orders.createPedido({
        mesa_id: context.mesaId,
        sessao_id: context.sessaoId,
        origem: 'assistente_virtual',
      })) as PedidoComItens;
    }

    return this.orders.addItem(pedido.id, {
      produto_id: produto.id,
      quantidade,
      observacoes,
    });
  }

  private async removerItemPedido(
    input: Record<string, unknown>,
    context: { mesaId: string; sessaoId: string },
  ): Promise<unknown> {
    const produtoNome = String(input.produto_nome ?? '');
    const pedido = (await this.orders.safeGetPedidoAtual(
      context.mesaId,
    )) as PedidoComItens | null;

    if (!pedido?.itens?.length) {
      throw new Error('Nao ha pedido ativo para esta mesa');
    }

    const produto = await this.catalog.findProdutoByNome(produtoNome);
    if (!produto) {
      throw new Error(`Produto "${produtoNome}" nao encontrado`);
    }

    const item = pedido.itens.find((i) => i.produto_id === produto.id);
    if (!item) {
      throw new Error(`Item "${produtoNome}" nao esta no pedido`);
    }

    return this.orders.removeItem(pedido.id, item.id);
  }

  private async consultarPedidoAtual(mesaId: string): Promise<unknown> {
    const pedido = await this.orders.safeGetPedidoAtual(mesaId);
    if (!pedido) {
      return { mensagem: 'Nenhum pedido ativo para esta mesa', itens: [] };
    }
    return pedido;
  }

  private async consultarIngredientes(
    input: Record<string, unknown>,
  ): Promise<unknown> {
    const produtoNome = String(input.produto_nome ?? '');
    const produto = await this.catalog.findProdutoByNome(produtoNome);
    if (!produto) {
      throw new Error(`Produto "${produtoNome}" nao encontrado`);
    }
    return {
      nome: produto.nome,
      ingredientes: produto.ingredientes,
      alergenos: produto.alergenos,
      tags: produto.tags,
      aviso:
        'Para alergias graves, recomendamos confirmar com a equipe do restaurante.',
    };
  }

  private async finalizarPedido(mesaId: string): Promise<unknown> {
    const pedido = (await this.orders.safeGetPedidoAtual(
      mesaId,
    )) as PedidoComItens | null;

    if (!pedido) {
      throw new Error('Nao ha pedido ativo para enviar a cozinha');
    }

    if (!pedido.itens?.length) {
      throw new Error('Pedido sem itens nao pode ser enviado a cozinha');
    }

    return this.orders.enviarCozinha(pedido.id);
  }

  private async chamarGarcom(
    input: Record<string, unknown>,
    context: { mesaId: string; sessaoId: string },
  ): Promise<unknown> {
    const motivo = String(input.motivo ?? 'Cliente solicitou atendimento');
    await this.realtime.emitChamarGarcom({
      mesa_id: context.mesaId,
      sessao_id: context.sessaoId,
      motivo,
    });
    return {
      mensagem: 'Garcom notificado. Alguem ira ate sua mesa em breve.',
      motivo,
    };
  }
}
