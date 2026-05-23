import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { produtoFotoUrl } from '../../../shared/produto-image.util';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-admin-produtos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ...MATERIAL_IMPORTS],
  templateUrl: './admin-produtos.component.html',
  styleUrl: './admin-produtos.component.scss',
})
export class AdminProdutosComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  produtos = signal<Produto[]>([]);
  displayedColumns = ['foto', 'nome', 'categoria', 'preco', 'ativo', 'acoes'];

  fotoUrl(p: Produto): string | null {
    return produtoFotoUrl(p);
  }

  ngOnInit(): void {
    this.catalog.getProdutos().subscribe((p) => this.produtos.set(p));
  }
}
