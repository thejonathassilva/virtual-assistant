import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe } from '@angular/common';
import { produtoFotoUrl } from '../../../shared/produto-image.util';
import { RestaurantBrandComponent } from '../../../shared/restaurant-brand/restaurant-brand.component';

const CATEGORIAS = [
  { id: '', label: 'Todos' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'pratos_principais', label: 'Pratos principais' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'sobremesas', label: 'Sobremesas' },
];

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, RestaurantBrandComponent, ...MATERIAL_IMPORTS],
  templateUrl: './cardapio.component.html',
  styleUrl: './cardapio.component.scss',
})
export class CardapioComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly publicApi = inject(PublicService);
  readonly tenant = inject(TenantContextService);

  produtos = signal<Produto[]>([]);
  loading = signal(true);
  filtro = signal('');
  busca = signal('');
  mesaId = signal('');
  categorias = CATEGORIAS;

  filtrados = computed(() => {
    const q = this.busca().toLowerCase();
    return this.produtos().filter(
      (p) =>
        !q ||
        p.nome.toLowerCase().includes(q) ||
        p.descricao?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  });

  ngOnInit(): void {
    this.mesaId.set(this.route.snapshot.paramMap.get('mesaId')!);
    const slug = this.route.parent?.snapshot.paramMap.get('slug');
    if (slug) {
      this.publicApi.getRestauranteBySlug(slug).subscribe({
        next: (r) => this.tenant.setTenant(r.id, r.slug),
      });
    }
    this.carregar();
  }

  mesaLink(): string[] {
    return this.tenant.mesaPath(this.mesaId());
  }

  carregar(): void {
    const cat = this.filtro();
    this.loading.set(true);
    this.catalog.getCardapio(cat || undefined).subscribe({
      next: (p) => {
        this.produtos.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setCategoria(id: string): void {
    this.filtro.set(id);
    this.carregar();
  }

  foto(p: Produto): string | null {
    return produtoFotoUrl(p);
  }
}
