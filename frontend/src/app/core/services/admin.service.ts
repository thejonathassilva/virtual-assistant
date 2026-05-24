import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Empresa, Usuario, UserRole } from '../models';

export interface UsuarioPayload {
  nome: string;
  email: string;
  role: UserRole;
  senha?: string;
  ativo?: boolean;
  restaurante_id?: string;
}

export interface OnboardingStatus {
  steps: { empresa: boolean; produtos: boolean; mesas: boolean };
  counts: { produtos: number; mesas: number };
  complete: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly http: HttpClient) {}

  getEmpresa() {
    return this.http.get<Empresa>(`${environment.apiUrl}/admin/empresa`);
  }

  updateEmpresa(body: Partial<Empresa>) {
    return this.http.put<Empresa>(`${environment.apiUrl}/admin/empresa`, body);
  }

  getOnboardingStatus() {
    return this.http.get<OnboardingStatus>(`${environment.apiUrl}/onboarding/status`);
  }

  getConfigIa() {
    return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/admin/config-ia`);
  }

  updateConfigIa(body: Record<string, unknown>) {
    return this.http.put(`${environment.apiUrl}/admin/config-ia`, body);
  }

  getMetricas(periodo = 'semana') {
    return this.http.get<MetricasIaResponse>(
      `${environment.apiUrl}/admin/metricas-ia`,
      { params: { periodo } },
    );
  }

  listarUsuarios() {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/admin/usuarios`);
  }

  getUsuario(id: string) {
    return this.http.get<Usuario>(`${environment.apiUrl}/admin/usuarios/${id}`);
  }

  criarUsuario(body: UsuarioPayload) {
    return this.http.post<Usuario>(`${environment.apiUrl}/admin/usuarios`, body);
  }

  atualizarUsuario(id: string, body: Partial<UsuarioPayload>) {
    return this.http.put<Usuario>(`${environment.apiUrl}/admin/usuarios/${id}`, body);
  }

  desativarUsuario(id: string) {
    return this.http.delete<Usuario>(`${environment.apiUrl}/admin/usuarios/${id}`);
  }
}

export interface MetricaIaDiaria {
  data: string;
  total_conversas: number;
  pedidos_completados_ia: number;
  fallbacks_garcom: number;
  tokens_consumidos_input: number;
  tokens_consumidos_output: number;
  custo_estimado_usd: number;
}

export interface MetricasIaResponse {
  periodo: string;
  metricas: MetricaIaDiaria[];
}
