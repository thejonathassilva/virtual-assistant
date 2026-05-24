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

  listarUsuarios() {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/admin/usuarios`);
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
}
