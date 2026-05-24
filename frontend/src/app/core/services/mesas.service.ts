import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Mesa } from '../models';

@Injectable({ providedIn: 'root' })
export class MesasService {
  constructor(private readonly http: HttpClient) {}

  listar() {
    return this.http.get<Mesa[]>(`${environment.apiUrl}/mesas`);
  }

  obter(id: string) {
    return this.http.get<Mesa>(`${environment.apiUrl}/mesas/${id}`);
  }

  abrirSessao(id: string) {
    return this.http.post<{ id: string }>(
      `${environment.apiUrl}/mesas/${id}/abrir-sessao`,
      {},
    );
  }

  criar(numero: number) {
    return this.http.post<Mesa>(`${environment.apiUrl}/mesas`, { numero });
  }

  baixarQrcode(id: string) {
    return this.http.get(`${environment.apiUrl}/mesas/${id}/qrcode`, {
      responseType: 'blob',
    });
  }
}
