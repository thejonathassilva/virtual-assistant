import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RESTAURANT_NAME } from '../constants/restaurant';
import { Empresa } from '../models';
import { environment } from '../../../environments/environment';

/** Dados públicos da marca (nome, logo) para telas do cliente. */
@Injectable({ providedIn: 'root' })
export class EmpresaBrandStore {
  private readonly http = inject(HttpClient);

  private readonly empresa = signal<Empresa | null>(null);
  private loadStarted = false;

  readonly nome = signal(RESTAURANT_NAME);
  readonly logoUrl = signal<string | null>(null);
  readonly loading = signal(false);

  ensureLoaded(): void {
    if (this.loadStarted) return;
    this.loadStarted = true;
    this.loading.set(true);
    this.http.get<Empresa>(`${environment.apiUrl}/empresa`).subscribe({
      next: (e) => {
        this.empresa.set(e);
        if (e.nome?.trim()) this.nome.set(e.nome.trim());
        this.logoUrl.set(e.logo_url?.trim() || null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  snapshot(): Empresa | null {
    return this.empresa();
  }

  applyFromEmpresa(e: Pick<Empresa, 'nome' | 'logo_url'>): void {
    if (e.nome?.trim()) this.nome.set(e.nome.trim());
    this.logoUrl.set(e.logo_url?.trim() || null);
  }
}
