import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { MesasService } from '../../../core/services/mesas.service';
import { Mesa } from '../../../core/models';
import { RestaurantBrandComponent } from '../../../shared/restaurant-brand/restaurant-brand.component';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-mesa-home',
  standalone: true,
  imports: [RouterLink, RestaurantBrandComponent, ...MATERIAL_IMPORTS],
  templateUrl: './mesa-home.component.html',
  styleUrl: './mesa-home.component.scss',
})
export class MesaHomeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly mesas = inject(MesasService);
  private readonly publicApi = inject(PublicService);
  readonly tenant = inject(TenantContextService);

  mesa = signal<Mesa | null>(null);
  mesaId = signal('');
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('mesaId')!;
    const slug =
      this.route.parent?.snapshot.paramMap.get('slug') ??
      this.route.snapshot.paramMap.get('slug');
    this.mesaId.set(id);

    const loadMesa = () => {
      this.mesas.obter(id).subscribe({
        next: (m) => {
          this.mesa.set(m);
          const tid = m.restaurante_id;
          const s = slug ?? m.restaurante_slug ?? undefined;
          if (tid) this.tenant.setTenant(tid, s ?? undefined);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    };

    if (slug) {
      this.publicApi.getRestauranteBySlug(slug).subscribe({
        next: (r) => {
          this.tenant.setTenant(r.id, r.slug);
          loadMesa();
        },
        error: () => this.loading.set(false),
      });
    } else {
      loadMesa();
    }
  }

  mesaLink(sub?: 'cardapio' | 'chat'): string[] {
    return this.tenant.mesaPath(this.mesaId(), sub);
  }

  abrirSessao(): void {
    this.mesas.abrirSessao(this.mesaId()).subscribe({
      next: (sessao: { id: string }) => {
        this.mesa.update((m) =>
          m ? { ...m, status: 'ocupada', sessao_ativa_id: sessao.id } : m,
        );
      },
    });
  }
}
