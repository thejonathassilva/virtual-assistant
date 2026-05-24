import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Empresa, Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CurrencyPipe, ...MATERIAL_IMPORTS],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  empresa = signal<Empresa | null>(null);
  produtos = signal<Produto[]>([]);

  ngOnInit(): void {
    if (localStorage.getItem('onboarding_done') !== '1') {
      this.admin.getOnboardingStatus().subscribe({
        next: (s) => {
          if (!s.complete) {
            this.router.navigate(['/admin/onboarding']);
            return;
          }
          this.loadDashboard();
        },
        error: () => this.loadDashboard(),
      });
    } else {
      this.loadDashboard();
    }
  }

  private loadDashboard(): void {
    this.admin.getEmpresa().subscribe((e) => this.empresa.set(e));
    this.catalog.getProdutos().subscribe((p) => this.produtos.set(p));
  }
}
