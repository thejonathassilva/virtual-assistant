import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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

  async getCardapio(): Promise<unknown> {
    const url = `${this.baseUrl}/cardapio`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getCardapioPorCategoria(categoria: string): Promise<unknown> {
    const url = `${this.baseUrl}/cardapio/${categoria}`;
    const { data } = await firstValueFrom(this.http.get(url));
    return data;
  }

  async getProdutos(): Promise<ProdutoCatalogo[]> {
    const url = `${this.baseUrl}/produtos`;
    const { data } = await firstValueFrom(this.http.get<ProdutoCatalogo[]>(url));
    return data;
  }

  async findProdutoByNome(nome: string): Promise<ProdutoCatalogo | null> {
    const produtos = await this.getProdutos();
    const normalized = nome.toLowerCase().trim();
    return (
      produtos.find(
        (p) =>
          p.ativo &&
          (p.nome.toLowerCase() === normalized ||
            p.nome.toLowerCase().includes(normalized) ||
            normalized.includes(p.nome.toLowerCase())),
      ) ?? null
    );
  }
}
