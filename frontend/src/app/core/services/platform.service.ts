import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RestauranteTenant, Usuario, UserRole } from '../models';

export interface UpdateRestaurantePayload {
  nome?: string;
  slug?: string;
  ativo?: boolean;
  token_quota_mensal?: number;
  quota_ilimitada?: boolean;
}

export interface CreateRestaurantePayload {
  nome: string;
  slug: string;
  token_quota_mensal?: number;
  quota_ilimitada?: boolean;
  clonar_cardapio_modelo?: boolean;
}

export interface MetricaIaDia {
  data: string;
  total_conversas: number;
  pedidos_completados_ia: number;
  fallbacks_garcom: number;
  tokens_consumidos_input: number;
  tokens_consumidos_output: number;
  custo_estimado_usd: number;
}

export interface PlatformMetricasTenant {
  restaurante_id: string;
  periodo: string;
  metricas: MetricaIaDia[];
  resumo: {
    total_conversas: number;
    pedidos_completados_ia: number;
    fallbacks_garcom: number;
    tokens_total: number;
    custo_estimado_brl: number;
  };
}

export interface PlatformMetricasResponse {
  periodo: string;
  tenants: PlatformMetricasTenant[];
  totais: {
    total_conversas: number;
    tokens_total: number;
    custo_estimado_brl: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly base = `${environment.apiUrl}/platform/restaurantes`;

  constructor(private readonly http: HttpClient) {}

  listar() {
    return this.http.get<RestauranteTenant[]>(this.base);
  }

  atualizar(id: string, body: UpdateRestaurantePayload) {
    return this.http.put<RestauranteTenant>(`${this.base}/${id}`, body);
  }

  criar(body: CreateRestaurantePayload) {
    return this.http.post<RestauranteTenant>(this.base, body);
  }

  getMetricas(periodo = 'semana', restauranteId?: string) {
    const params: Record<string, string> = { periodo };
    if (restauranteId) params['restaurante_id'] = restauranteId;
    return this.http.get<PlatformMetricasResponse>(
      `${environment.apiUrl}/platform/metricas-ia`,
      { params },
    );
  }

  getAdminRestaurante(restauranteId: string) {
    return this.http.get<Usuario | null>(`${this.base}/${restauranteId}/admin`);
  }

  criarAdminRestaurante(
    restauranteId: string,
    body: { nome: string; email: string; senha: string },
  ) {
    return this.http.post<Usuario>(`${environment.apiUrl}/admin/usuarios`, {
      ...body,
      role: 'admin' as UserRole,
      restaurante_id: restauranteId,
      ativo: true,
    });
  }

  atualizarAdminUsuario(
    id: string,
    body: { nome?: string; email?: string; senha?: string },
  ) {
    return this.http.put<Usuario>(`${environment.apiUrl}/admin/usuarios/${id}`, body);
  }
}
