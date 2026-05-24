import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MesasService } from '../../../core/services/mesas.service';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-mesa-legacy-redirect',
  standalone: true,
  imports: [...MATERIAL_IMPORTS],
  template: `<div class="center"><mat-spinner /></div>`,
  styles: [
    `
      .center {
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class MesaLegacyRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mesas = inject(MesasService);

  ngOnInit(): void {
    const mesaId = this.route.snapshot.paramMap.get('mesaId')!;
    const url = this.router.url;
    let sub: string | undefined;
    if (url.includes('/cardapio')) sub = 'cardapio';
    else if (url.includes('/chat')) sub = 'chat';
    this.mesas.obter(mesaId).subscribe({
      next: (m) => {
        const slug = m.restaurante_slug || 'duas-maos-uma-mesa';
        const path = sub
          ? `/r/${slug}/mesa/${mesaId}/${sub}`
          : `/r/${slug}/mesa/${mesaId}`;
        this.router.navigateByUrl(path, { replaceUrl: true });
      },
      error: () => this.router.navigate(['/']),
    });
  }
}
