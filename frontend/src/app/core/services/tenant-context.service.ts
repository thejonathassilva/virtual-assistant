import { Injectable, signal } from '@angular/core';
import { setMesaRestauranteId } from '../interceptors/tenant.interceptor';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  readonly slug = signal<string | null>(null);
  readonly restauranteId = signal<string | null>(null);

  setTenant(restauranteId: string, slug?: string): void {
    this.restauranteId.set(restauranteId);
    setMesaRestauranteId(restauranteId);
    if (slug) this.slug.set(slug);
  }

  mesaPath(mesaId: string, sub?: 'cardapio' | 'chat'): string[] {
    const s = this.slug();
    const base = s ? ['/r', s, 'mesa', mesaId] : ['/mesa', mesaId];
    return sub ? [...base, sub] : base;
  }
}
