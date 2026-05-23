import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Produto } from '../models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  constructor(private readonly http: HttpClient) {}

  getCardapio(categoria?: string) {
    const url = categoria
      ? `${environment.apiUrl}/cardapio/${categoria}`
      : `${environment.apiUrl}/cardapio`;
    return this.http.get<Produto[]>(url);
  }

  getProdutos() {
    return this.http.get<Produto[]>(`${environment.apiUrl}/produtos`);
  }

  createProduto(body: Partial<Produto>) {
    return this.http.post<Produto>(`${environment.apiUrl}/produtos`, body);
  }

  updateProduto(id: string, body: Partial<Produto>) {
    return this.http.put<Produto>(`${environment.apiUrl}/produtos/${id}`, body);
  }

  deleteProduto(id: string) {
    return this.http.delete(`${environment.apiUrl}/produtos/${id}`);
  }

  getProduto(id: string) {
    return this.http.get<Produto>(`${environment.apiUrl}/produtos/${id}`);
  }

  uploadFoto(id: string, file: File) {
    const form = new FormData();
    form.append('foto', file);
    return this.http.post<Produto>(`${environment.apiUrl}/produtos/${id}/foto`, form);
  }
}
