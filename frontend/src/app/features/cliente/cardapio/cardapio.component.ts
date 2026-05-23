import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe } from '@angular/common';
import { produtoFotoUrl } from '../../../shared/produto-image.util';
import { CategoriaLabelPipe } from '../../../shared/categoria-label.pipe';

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
  imports: [RouterLink, CurrencyPipe, CategoriaLabelPipe, ...MATERIAL_IMPORTS],
  templateUrl: './cardapio.component.html',
  styleUrl: './cardapio.component.scss',
})
export class CardapioComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);

  produtos = signal<Produto[]>([]);
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
    this.carregar();
  }

  carregar(): void {
    const cat = this.filtro();
    this.catalog.getCardapio(cat || undefined).subscribe((p) => this.produtos.set(p));
  }

  setCategoria(id: string): void {
    this.filtro.set(id);
    this.carregar();
  }

  foto(p: Produto): string | null {
    return produtoFotoUrl(p);
  }
}
