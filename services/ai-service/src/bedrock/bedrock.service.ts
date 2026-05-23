import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigIa } from '../entities/config-ia.entity';
import { ChatMessage, MesaSession } from '../session/session.types';
import { ChatMessageRole } from '../common/enums';
import { DEFAULT_RESTAURANT_NAME } from '../common/constants/default-config';
import { ToolExecutorService } from './tool-executor.service';
import { ToolName } from './tool-definitions';

export interface BedrockResponse {
  text: string;
  toolCalls: Array<{ name: ToolName; input: Record<string, unknown> }>;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  guardrailBlocked: boolean;
}

@Injectable()
export class BedrockService {
  private readonly logger = new Logger(BedrockService.name);
  private readonly useMock: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly toolExecutor: ToolExecutorService,
  ) {
    const llmProvider = (
      config.get<string>('LLM_PROVIDER') ?? 'mock'
    ).toLowerCase();
    const bedrockMock =
      (config.get<string>('BEDROCK_MOCK') ?? 'true').toLowerCase() === 'true';
    this.useMock = llmProvider === 'mock' || bedrockMock;

    if (!this.useMock && llmProvider !== 'aws-bedrock') {
      this.logger.warn(
        `LLM_PROVIDER=${llmProvider} ainda nao implementado; usando mock. Veja services/ai-service/src/llm/README.md`,
      );
      this.useMock = true;
    }
  }

  async converse(
    userMessage: string,
    session: MesaSession,
    configIa: ConfigIa,
  ): Promise<BedrockResponse> {
    const start = Date.now();

    if (this.isBlocked(userMessage, configIa)) {
      return {
        text: 'Desculpe, nao posso ajudar com isso. Posso ajudar com seu pedido ou chamar o garcom?',
        toolCalls: [],
        inputTokens: 50,
        outputTokens: 30,
        latencyMs: Date.now() - start,
        guardrailBlocked: true,
      };
    }

    if (this.useMock) {
      return this.mockConverse(userMessage, session, configIa, start);
    }

    return this.realConverse(userMessage, session, configIa, start);
  }

  private isBlocked(message: string, config: ConfigIa): boolean {
    const lower = message.toLowerCase();

    for (const tema of config.temas_bloqueados ?? []) {
      if (lower.includes(tema.toLowerCase())) {
        return true;
      }
    }

    for (const palavra of config.palavras_bloqueadas ?? []) {
      if (palavra && lower.includes(palavra.toLowerCase())) {
        return true;
      }
    }

    const piiPatterns = [
      /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/,
      /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/,
      /\(\d{2}\)\s?\d{4,5}-?\d{4}/,
    ];
    return piiPatterns.some((p) => p.test(message));
  }

  private buildSystemPrompt(config: ConfigIa, mesaId: string): string {
    return config.prompt_sistema
      .replace(/\{nome_restaurante\}/g, DEFAULT_RESTAURANT_NAME)
      .replace(/\{mesa_id\}/g, mesaId);
  }

  private async mockConverse(
    userMessage: string,
    session: MesaSession,
    configIa: ConfigIa,
    start: number,
  ): Promise<BedrockResponse> {
    const lower = userMessage.toLowerCase();
    const toolCalls: BedrockResponse['toolCalls'] = [];
    let text = '';
    const context = {
      mesaId: session.mesa_id,
      sessaoId: session.sessao_id,
    };

    const isFirstMessage = session.messages.filter(
      (m) => m.role === ChatMessageRole.USER,
    ).length <= 1;

    if (isFirstMessage) {
      text =
        `Ola! Bem-vindo ao ${DEFAULT_RESTAURANT_NAME}! Sou seu assistente virtual. Posso ajudar com o cardapio, fazer pedidos ou tirar duvidas sobre ingredientes. O que deseja?`;
    }

    // Intent: garcom
    if (
      /garcom|garçom|atendente|humano|pessoa|ajuda humana|chamar/.test(lower)
    ) {
      toolCalls.push({
        name: 'chamar_garcom',
        input: { motivo: userMessage },
      });
      const result = await this.toolExecutor.execute(
        'chamar_garcom',
        { motivo: userMessage },
        context,
      );
      text =
        'Chamei o garcom para voce! Alguem ira ate sua mesa em breve. Enquanto isso, posso ajudar com mais alguma coisa?';
      if (result.status === 'error') {
        text =
          'Registrei sua solicitacao. Um garcom sera avisado. Posso ajudar com mais alguma coisa?';
      }
      session.fallback_garcom = true;
    }
    // Intent: cardapio
    else if (
      /cardapio|cardápio|menu|opcoes|opções|o que tem|pratos|bebidas|lanches|vegano|vegetariano|sem gl[uú]ten/.test(
        lower,
      )
    ) {
      let categoria = 'todos';
      if (/bebida|refrigerante|suco|cerveja/.test(lower)) {
        categoria = 'bebidas';
      } else if (/sobremesa|doce/.test(lower)) {
        categoria = 'sobremesas';
      } else if (/entrada/.test(lower)) {
        categoria = 'entradas';
      } else if (/prato|lanche|hamburguer|hambúrguer|burger/.test(lower)) {
        categoria = 'pratos_principais';
      }

      let restricao = 'nenhuma';
      if (/vegano/.test(lower)) restricao = 'vegano';
      else if (/vegetariano/.test(lower)) restricao = 'vegetariano';
      else if (/sem gl[uú]ten|gluten/.test(lower)) restricao = 'sem_gluten';
      else if (/sem lactose|lactose/.test(lower)) restricao = 'sem_lactose';

      toolCalls.push({
        name: 'consultar_cardapio',
        input: { categoria, restricao_alimentar: restricao },
      });
      const result = await this.toolExecutor.execute(
        'consultar_cardapio',
        { categoria, restricao_alimentar: restricao },
        context,
      );
      text = this.formatCardapioResponse(result.content);
    }
    // Intent: pedido - consultar
    else if (
      /meu pedido|pedido atual|o que pedi|conta|resumo|total/.test(lower)
    ) {
      toolCalls.push({ name: 'consultar_pedido_atual', input: {} });
      const result = await this.toolExecutor.execute(
        'consultar_pedido_atual',
        {},
        context,
      );
      text = this.formatPedidoResponse(result.content);
    }
    // Intent: ingredientes
    else if (
      /ingrediente|alergeno|alergia|contém|contem|tem gl[uú]ten|tem lactose/.test(
        lower,
      )
    ) {
      const produtoNome = this.extractProdutoNome(userMessage);
      toolCalls.push({
        name: 'consultar_ingredientes',
        input: { produto_nome: produtoNome },
      });
      const result = await this.toolExecutor.execute(
        'consultar_ingredientes',
        { produto_nome: produtoNome },
        context,
      );
      text = this.formatIngredientesResponse(result.content);
    }
    // Intent: finalizar
    else if (
      /finalizar|enviar|mandar|cozinha|pronto|só isso|so isso|pode enviar|confirma/.test(
        lower,
      )
    ) {
      toolCalls.push({ name: 'finalizar_pedido', input: {} });
      const result = await this.toolExecutor.execute(
        'finalizar_pedido',
        {},
        context,
      );
      if (result.status === 'success') {
        text =
          'Pedido enviado para a cozinha! Em breve seus itens estarao sendo preparados. Deseja pedir mais alguma coisa?';
        session.pedido_finalizado = true;
      } else {
        text = `Nao consegui enviar o pedido: ${(result.content as { message?: string })?.message ?? 'verifique se ha itens no pedido'}.`;
      }
    }
    // Intent: remover
    else if (/tira|remove|cancela|sem o|sem a/.test(lower)) {
      const produtoNome = this.extractProdutoNome(userMessage);
      toolCalls.push({
        name: 'remover_item_pedido',
        input: { produto_nome: produtoNome },
      });
      const result = await this.toolExecutor.execute(
        'remover_item_pedido',
        { produto_nome: produtoNome },
        context,
      );
      text =
        result.status === 'success'
          ? `Removi "${produtoNome}" do seu pedido. Mais alguma alteracao?`
          : `Nao consegui remover: ${(result.content as { message?: string })?.message}.`;
    }
    // Intent: pedido - adicionar
    else if (
      /quero|pedir|pedido|adiciona|coloca|me ve|me vê|uma |um |x\d|\d+/.test(
        lower,
      )
    ) {
      const produtoNome = this.extractProdutoNome(userMessage);
      const quantidade = this.extractQuantidade(userMessage);
      const observacoes = this.extractObservacoes(userMessage);

      toolCalls.push({
        name: 'adicionar_item_pedido',
        input: {
          produto_nome: produtoNome,
          quantidade,
          observacoes,
        },
      });
      const result = await this.toolExecutor.execute(
        'adicionar_item_pedido',
        {
          produto_nome: produtoNome,
          quantidade,
          observacoes,
        },
        context,
      );
      text =
        result.status === 'success'
          ? `Adicionei ${quantidade}x "${produtoNome}" ao seu pedido! Deseja mais alguma coisa ou posso enviar para a cozinha?`
          : `Nao consegui adicionar: ${(result.content as { message?: string })?.message}. Quer ver o cardapio?`;
    } else if (!text) {
      text =
        'Posso ajudar com o cardapio, fazer seu pedido, consultar ingredientes ou chamar o garcom. O que voce precisa?';
    }

    void this.buildSystemPrompt(configIa, session.mesa_id);

    return {
      text,
      toolCalls,
      inputTokens: 120 + userMessage.length,
      outputTokens: 80 + text.length,
      latencyMs: Date.now() - start,
      guardrailBlocked: false,
    };
  }

  private async realConverse(
    userMessage: string,
    session: MesaSession,
    configIa: ConfigIa,
    start: number,
  ): Promise<BedrockResponse> {
    try {
      const { BedrockRuntimeClient, ConverseCommand } = await import(
        '@aws-sdk/client-bedrock-runtime'
      );

      const client = new BedrockRuntimeClient({
        region: this.config.get<string>('AWS_REGION') ?? 'us-east-1',
      });

      const messages = session.messages
        .filter((m) => m.role === ChatMessageRole.USER || m.role === ChatMessageRole.ASSISTANT)
        .slice(-20)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: [{ text: m.content }],
        }));

      messages.push({
        role: 'user',
        content: [{ text: userMessage }],
      });

      const command = new ConverseCommand({
        modelId: configIa.modelo_id,
        system: [{ text: this.buildSystemPrompt(configIa, session.mesa_id) }],
        messages,
        inferenceConfig: {
          temperature: configIa.temperature,
          topP: configIa.top_p,
          maxTokens: configIa.max_tokens,
          stopSequences: configIa.stop_sequences?.length
            ? configIa.stop_sequences
            : undefined,
        },
      });

      const response = await client.send(command);
      const output = response.output?.message;
      let text = '';
      const toolCalls: BedrockResponse['toolCalls'] = [];

      for (const block of output?.content ?? []) {
        if ('text' in block && block.text) {
          text += block.text;
        }
        if ('toolUse' in block && block.toolUse) {
          const name = block.toolUse.name as ToolName;
          const input = (block.toolUse.input ?? {}) as Record<string, unknown>;
          toolCalls.push({ name, input });
          const result = await this.toolExecutor.execute(name, input, {
            mesaId: session.mesa_id,
            sessaoId: session.sessao_id,
          });
          if (name === 'chamar_garcom') session.fallback_garcom = true;
          if (name === 'finalizar_pedido' && result.status === 'success') {
            session.pedido_finalizado = true;
          }
          text += `\n[${name}]: ${JSON.stringify(result.content)}`;
        }
      }

      return {
        text: text || 'Como posso ajudar?',
        toolCalls,
        inputTokens: response.usage?.inputTokens ?? 0,
        outputTokens: response.usage?.outputTokens ?? 0,
        latencyMs: Date.now() - start,
        guardrailBlocked: false,
      };
    } catch (error) {
      this.logger.error('Erro no Bedrock, usando fallback', error);
      const result = await this.toolExecutor.execute(
        'chamar_garcom',
        { motivo: 'Falha no servico de IA' },
        { mesaId: session.mesa_id, sessaoId: session.sessao_id },
      );
      session.fallback_garcom = true;
      return {
        text: 'Estou com dificuldade no momento. Chamei o garcom para te ajudar!',
        toolCalls: [{ name: 'chamar_garcom', input: { motivo: 'Falha IA' } }],
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - start,
        guardrailBlocked: false,
      };
    }
  }

  private extractProdutoNome(message: string): string {
    const cleaned = message
      .replace(
        /quero|pedir|adiciona|coloca|me ve|me vê|uma|um|por favor|pfv|tira|remove|sem|o|a|de|ingredientes|alergenos/gi,
        '',
      )
      .replace(/\d+x?\s*/g, '')
      .trim();
    return cleaned || 'item';
  }

  private extractQuantidade(message: string): number {
    const match = message.match(/(\d+)\s*x|x\s*(\d+)|(\d+)\s+(?:de|un)/i);
    if (match) {
      return Number(match[1] ?? match[2] ?? match[3]) || 1;
    }
    return 1;
  }

  private extractObservacoes(message: string): string | undefined {
    const match = message.match(/sem\s+[\w\s]+|bem\s+passado|mal\s+passado|extra/gi);
    return match?.[0];
  }

  private formatCardapioResponse(content: unknown): string {
    if (!content) {
      return 'Nao encontrei itens no cardapio no momento.';
    }
    if (Array.isArray(content)) {
      const items = content as Array<{ nome: string; preco: string }>;
      if (items.length === 0) {
        return 'Nenhum item encontrado com esse filtro.';
      }
      const lines = items.slice(0, 8).map((p) => `- ${p.nome}: R$ ${p.preco}`);
      const extra =
        items.length > 8 ? `\n... e mais ${items.length - 8} itens.` : '';
      return `Aqui esta o cardapio:\n${lines.join('\n')}${extra}\nO que gostaria de pedir?`;
    }
    return 'Consultei o cardapio. Posso detalhar alguma categoria ou ajudar com seu pedido?';
  }

  private formatPedidoResponse(content: unknown): string {
    const pedido = content as {
      mensagem?: string;
      itens?: Array<{ quantidade: number; produto_id: string }>;
      valor_total?: string;
    };
    if (pedido?.mensagem) {
      return pedido.mensagem;
    }
    if (!pedido?.itens?.length) {
      return 'Seu pedido esta vazio. Quer ver o cardapio?';
    }
    return `Seu pedido tem ${pedido.itens.length} item(ns). Total parcial: R$ ${pedido.valor_total ?? '0.00'}. Deseja adicionar algo ou enviar para a cozinha?`;
  }

  private formatIngredientesResponse(content: unknown): string {
    const info = content as {
      nome?: string;
      ingredientes?: string[];
      alergenos?: string[];
      aviso?: string;
    };
    if (!info?.nome) {
      return String((content as { message?: string })?.message ?? 'Produto nao encontrado.');
    }
    return `**${info.nome}**\nIngredientes: ${info.ingredientes?.join(', ') || 'nao informado'}\nAlergenos: ${info.alergenos?.join(', ') || 'nenhum listado'}\n\n${info.aviso ?? ''}`;
  }
}
