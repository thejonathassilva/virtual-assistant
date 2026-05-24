import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface RestaurantePublico {
  id: string;
  slug: string;
  nome: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class PublicService {
  constructor(private readonly http: HttpClient) {}

  getRestauranteBySlug(slug: string) {
    return this.http.get<RestaurantePublico>(
      `${environment.apiUrl}/public/restaurantes/${slug}`,
    );
  }
}
