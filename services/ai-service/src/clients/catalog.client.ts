import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_RESTAURANTE_ID } from '../common/tenant';

export interface ProdutoCatalogo {
  id: string;
  nome: string;
  descricao?: string;
  preco: string;
  categoria: string;
  ingredientes: string[];
  alergenos: string[];
  tags: string[];
  ativo: boolean;
}

/** Termos do cliente → palavras-chave para achar produto no cardápio */
const PRODUTO_ALIASES: Array<{ match: RegExp; keywords: string[] }> = [
  { match: /batata\s*frit/i, keywords: ['batata frita'] },
  { match: /\bcoca[\s-]?cola\b|\bcoca\b/i, keywords: ['refrigerante', 'coca'] },
  { match: /\bnuggets?\b/i, keywords: ['nugget'] },
  { match: /\bonion\s*rings?\b/i, keywords: ['onion'] },
  { match: /\bx[\s-]?burger\b|\bhamb[uú]rguer\b/i, keywords: ['burger', 'x-'] },
  { match: /\bbrownie\b/i, keywords: ['brownie'] },
  { match: /\bsuco\b/i, keywords: ['suco'] },
];

@Injectable()
export class CatalogClient {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl =
      config.get<string>('CATALOG_SERVICE_URL') ??
      'http://catalog-service:3002';
  }

  private headers(restauranteId?: string) {
    const tid = restauranteId?.trim() || DEFAULT_RESTAURANTE_ID;
    return { 'x-restaurante-id': tid };
  }

  async getCardapio(restauranteId?: string): Promise<unknown> {
    const url = `${this.baseUrl}/cardapio`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: this.headers(restauranteId) }),
    );
    return data;
  }

  async getCardapioPorCategoria(
    categoria: string,
    restauranteId?: string,
  ): Promise<unknown> {
    const url = `${this.baseUrl}/cardapio/${categoria}`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: this.headers(restauranteId) }),
    );
    return data;
  }

  async getProdutos(restauranteId?: string): Promise<ProdutoCatalogo[]> {
    const url = `${this.baseUrl}/produtos`;
    const { data } = await firstValueFrom(
      this.http.get<ProdutoCatalogo[]>(url, {
        headers: this.headers(restauranteId),
      }),
    );
    return data;
  }

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  async findProdutoByNome(
    nome: string,
    restauranteId?: string,
  ): Promise<ProdutoCatalogo | null> {
    const matches = await this.matchProdutosInMessage(nome, restauranteId);
    return matches[0] ?? null;
  }

  async matchProdutosInMessage(
    message: string,
    restauranteId?: string,
  ): Promise<ProdutoCatalogo[]> {
    const produtos = await this.getProdutos(restauranteId);
    const ativos = produtos.filter((p) => p.ativo);
    const normMsg = this.normalize(message);
    const found: ProdutoCatalogo[] = [];
    const usedIds = new Set<string>();

    for (const alias of PRODUTO_ALIASES) {
      if (!alias.match.test(message)) continue;
      const hit = ativos.find((p) => {
        if (usedIds.has(p.id)) return false;
        const n = this.normalize(p.nome);
        const d = this.normalize(p.descricao ?? '');
        return alias.keywords.some((k) => n.includes(k) || d.includes(k));
      });
      if (hit) {
        found.push(hit);
        usedIds.add(hit.id);
      }
    }

    const sorted = [...ativos].sort((a, b) => b.nome.length - a.nome.length);
    for (const p of sorted) {
      if (usedIds.has(p.id)) continue;
      const n = this.normalize(p.nome);
      if (n.length >= 4 && normMsg.includes(n)) {
        found.push(p);
        usedIds.add(p.id);
      }
    }

    return found;
  }
}
