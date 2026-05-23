import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { produtoFotoUrl } from '../../../shared/produto-image.util';
import { CategoriaLabelPipe } from '../../../shared/categoria-label.pipe';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-admin-produtos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, CategoriaLabelPipe, ...MATERIAL_IMPORTS],
  templateUrl: './admin-produtos.component.html',
  styleUrl: './admin-produtos.component.scss',
})
export class AdminProdutosComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  produtos = signal<Produto[]>([]);
  brokenImages = signal<Set<string>>(new Set());
  displayedColumns = ['foto', 'nome', 'categoria', 'preco', 'ativo', 'acoes'];

  fotoUrl(p: Produto): string | null {
    return produtoFotoUrl(p);
  }

  showFoto(p: Produto): boolean {
    return !!this.fotoUrl(p) && !this.brokenImages().has(p.id);
  }

  onImgError(id: string): void {
    this.brokenImages.update((s) => new Set(s).add(id));
  }

  ngOnInit(): void {
    this.catalog.getProdutos().subscribe((p) => this.produtos.set(p));
  }
}
