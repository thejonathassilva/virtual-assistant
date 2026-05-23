import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ProdutoCatalogo {
  id: string;
  nome: string;
  preco: number;
  ativo?: boolean;
}

@Injectable()
export class CatalogClient {
  private readonly logger = new Logger(CatalogClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl =
      config.get<string>('CATALOG_SERVICE_URL') ?? 'http://catalog-service:3002';
  }

  async getProduto(produtoId: string): Promise<ProdutoCatalogo> {
    const url = `${this.baseUrl}/produtos/${produtoId}`;
    try {
      const { data } = await firstValueFrom(
        this.http.get<ProdutoCatalogo | { data: ProdutoCatalogo }>(url),
      );
      const produto = 'data' in data && data.data ? data.data : (data as ProdutoCatalogo);
      if (!produto?.id) {
        throw new NotFoundException(`Produto ${produtoId} não encontrado`);
      }
      return produto;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        throw new NotFoundException(`Produto ${produtoId} não encontrado`);
      }
      this.logger.error(`Falha ao consultar catálogo: ${produtoId}`, error);
      throw new ServiceUnavailableException('Catálogo indisponível');
    }
  }
}
