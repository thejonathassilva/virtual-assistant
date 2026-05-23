import { Injectable, signal } from '@angular/core';
import { CatalogService } from './catalog.service';
import { Produto } from '../models';

@Injectable({ providedIn: 'root' })
export class ProdutoCatalogoStore {
  private readonly mapSignal = signal<Record<string, Produto>>({});
  private loaded = false;

  constructor(private readonly catalog: CatalogService) {}

  readonly map = this.mapSignal.asReadonly();

  ensureLoaded() {
    if (this.loaded) return;
    this.catalog.getCardapio().subscribe((list) => {
      const map: Record<string, Produto> = {};
      list.forEach((p) => (map[p.id] = p));
      this.mapSignal.set(map);
      this.loaded = true;
    });
  }

  get(id: string): Produto | undefined {
    return this.mapSignal()[id];
  }

  invalidate() {
    this.loaded = false;
    this.mapSignal.set({});
  }
}
