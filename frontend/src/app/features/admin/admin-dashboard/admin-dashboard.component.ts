import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  AdminService,
  MetricaIaDiaria,
  MetricasIaResponse,
} from '../../../core/services/admin.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { Empresa, Produto } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

export interface BarChartItem {
  label: string;
  value: number;
  pct: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CurrencyPipe, DatePipe, DecimalPipe, ...MATERIAL_IMPORTS],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly catalog = inject(CatalogService);

  empresa = signal<Empresa | null>(null);
  produtos = signal<Produto[]>([]);
  metricas = signal<MetricasIaResponse | null>(null);
  conversasChart = signal<BarChartItem[]>([]);
  tokensChart = signal<BarChartItem[]>([]);

  ngOnInit(): void {
    this.admin.getEmpresa().subscribe((e) => this.empresa.set(e));
    this.catalog.getProdutos().subscribe((p) => this.produtos.set(p));
    this.admin.getMetricas('semana').subscribe((m) => {
      this.metricas.set(m);
      this.conversasChart.set(this.toBars(m.metricas, (x) => x.total_conversas));
      this.tokensChart.set(
        this.toBars(
          m.metricas,
          (x) => x.tokens_consumidos_input + x.tokens_consumidos_output,
        ),
      );
    });
  }

  totalConversas(): number {
    return (this.metricas()?.metricas ?? []).reduce(
      (s, m) => s + m.total_conversas,
      0,
    );
  }

  totalCustoUsd(): number {
    return (this.metricas()?.metricas ?? []).reduce(
      (s, m) => s + Number(m.custo_estimado_usd),
      0,
    );
  }

  private toBars(
    rows: MetricaIaDiaria[],
    pick: (m: MetricaIaDiaria) => number,
  ): BarChartItem[] {
    const sorted = [...rows].sort((a, b) => a.data.localeCompare(b.data));
    const max = Math.max(1, ...sorted.map(pick));
    return sorted.map((m) => {
      const value = pick(m);
      return {
        label: m.data.slice(5),
        value,
        pct: Math.round((value / max) * 100),
      };
    });
  }
}
