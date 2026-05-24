import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RestauranteTenant } from '../../../core/models';
import {
  MetricaIaDia,
  PlatformMetricasResponse,
  PlatformMetricasTenant,
  PlatformService,
} from '../../../core/services/platform.service';
import { MATERIAL_IMPORTS } from '../../../shared/material';

type DialogMode = 'criar' | 'editar' | null;

export interface BarChartItem {
  label: string;
  value: number;
  pct: number;
}

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, DatePipe, ...MATERIAL_IMPORTS],
  templateUrl: './platform-dashboard.component.html',
  styleUrl: './platform-dashboard.component.scss',
})
export class PlatformDashboardComponent implements OnInit {
  private readonly platform = inject(PlatformService);
  private readonly fb = inject(FormBuilder);

  restaurantes = signal<RestauranteTenant[]>([]);
  loading = signal(true);
  saving = signal(false);
  dialogMode = signal<DialogMode>(null);
  editando = signal<RestauranteTenant | null>(null);
  error = signal<string | null>(null);
  slugManual = signal(false);

  metricasPlataforma = signal<PlatformMetricasResponse | null>(null);
  metricasLoading = signal(false);
  metricasRestaurante = signal<RestauranteTenant | null>(null);
  conversasChart = signal<BarChartItem[]>([]);
  tokensChart = signal<BarChartItem[]>([]);

  displayedColumns = [
    'nome',
    'slug',
    'uso',
    'custo',
    'renovacao',
    'ativo',
    'acoes',
  ];

  cotaForm = this.fb.nonNullable.group({
    token_quota_mensal: [500_000, [Validators.required, Validators.min(1000)]],
    quota_ilimitada: [false],
    ativo: [true],
    admin_id: [''],
    admin_nome: ['', Validators.required],
    admin_email: ['', [Validators.required, Validators.email]],
    admin_senha: [''],
  });

  criarForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    token_quota_mensal: [500_000, [Validators.required, Validators.min(1000)]],
    quota_ilimitada: [false],
    clonar_cardapio_modelo: [true],
    admin_nome: ['Administrador', Validators.required],
    admin_email: ['', [Validators.required, Validators.email]],
    admin_senha: ['Restaurante@123', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.carregar();
    this.carregarMetricas();
    this.criarForm.controls.nome.valueChanges.subscribe((nome) => {
      if (!this.slugManual() && this.dialogMode() === 'criar') {
        this.criarForm.controls.slug.setValue(this.slugify(nome), {
          emitEvent: false,
        });
      }
    });
  }

  carregar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.platform.listar().subscribe({
      next: (rows) => {
        this.restaurantes.set(rows);
        this.loading.set(false);
        this.carregarMetricas();
        const sel = this.metricasRestaurante();
        if (sel) this.carregarMetricas(sel.id);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Não foi possível carregar os restaurantes.');
      },
    });
  }

  carregarMetricas(restauranteId?: string): void {
    this.metricasLoading.set(true);
    this.platform.getMetricas('semana', restauranteId).subscribe({
      next: (data) => {
        if (restauranteId) {
          const tenant = data.tenants[0];
          if (tenant) {
            this.atualizarCharts(tenant);
          }
        } else {
          this.metricasPlataforma.set(data);
        }
        this.metricasLoading.set(false);
      },
      error: () => this.metricasLoading.set(false),
    });
  }

  abrirMetricas(r: RestauranteTenant): void {
    this.metricasRestaurante.set(r);
    this.carregarMetricas(r.id);
  }

  fecharMetricas(): void {
    this.metricasRestaurante.set(null);
    this.conversasChart.set([]);
    this.tokensChart.set([]);
  }

  resumoTenant(restauranteId: string): PlatformMetricasTenant | undefined {
    return this.metricasPlataforma()?.tenants.find(
      (t) => t.restaurante_id === restauranteId,
    );
  }

  abrirCriar(): void {
    this.error.set(null);
    this.slugManual.set(false);
    this.criarForm.reset({
      nome: '',
      slug: '',
      token_quota_mensal: 500_000,
      quota_ilimitada: false,
      clonar_cardapio_modelo: true,
      admin_nome: 'Administrador',
      admin_email: '',
      admin_senha: 'Restaurante@123',
    });
    this.onCriarIlimitadoChange(false);
    this.dialogMode.set('criar');
  }

  abrirEdicao(r: RestauranteTenant): void {
    this.error.set(null);
    this.editando.set(r);
    this.cotaForm.patchValue({
      token_quota_mensal: r.token_quota_mensal ?? 500_000,
      quota_ilimitada: r.quota_ilimitada,
      ativo: r.ativo,
      admin_id: '',
      admin_nome: 'Administrador',
      admin_email: '',
      admin_senha: '',
    });
    this.onIlimitadoChange(r.quota_ilimitada);
    this.dialogMode.set('editar');
    this.platform.getAdminRestaurante(r.id).subscribe({
      next: (admin) => {
        if (admin) {
          this.cotaForm.patchValue({
            admin_id: admin.id,
            admin_nome: admin.nome,
            admin_email: admin.email,
            admin_senha: '',
          });
        }
      },
    });
  }

  fecharDialog(): void {
    this.dialogMode.set(null);
    this.editando.set(null);
    this.error.set(null);
  }

  onSlugInput(): void {
    this.slugManual.set(true);
  }

  onIlimitadoChange(checked: boolean): void {
    if (checked) {
      this.cotaForm.controls.token_quota_mensal.disable();
    } else {
      this.cotaForm.controls.token_quota_mensal.enable();
    }
  }

  onCriarIlimitadoChange(checked: boolean): void {
    if (checked) {
      this.criarForm.controls.token_quota_mensal.disable();
    } else {
      this.criarForm.controls.token_quota_mensal.enable();
    }
  }

  salvarEdicao(): void {
    const r = this.editando();
    if (!r || this.cotaForm.invalid) return;
    const raw = this.cotaForm.getRawValue();
    if (raw.admin_senha && raw.admin_senha.length < 8) {
      this.error.set('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const salvarAdmin = () => {
      const adminBody = {
        nome: raw.admin_nome,
        email: raw.admin_email,
        ...(raw.admin_senha ? { senha: raw.admin_senha } : {}),
      };
      if (raw.admin_id) {
        return this.platform.atualizarAdminUsuario(raw.admin_id, adminBody);
      }
      if (!raw.admin_senha) {
        this.error.set('Informe uma senha para criar o administrador.');
        this.saving.set(false);
        return null;
      }
      return this.platform.criarAdminRestaurante(r.id, {
        nome: raw.admin_nome,
        email: raw.admin_email,
        senha: raw.admin_senha,
      });
    };

    this.platform
      .atualizar(r.id, {
        token_quota_mensal: raw.quota_ilimitada ? undefined : raw.token_quota_mensal,
        quota_ilimitada: raw.quota_ilimitada,
        ativo: raw.ativo,
      })
      .subscribe({
        next: () => {
          const adminReq = salvarAdmin();
          if (!adminReq) return;
          adminReq.subscribe({
            next: () => {
              this.saving.set(false);
              this.fecharDialog();
              this.carregar();
            },
            error: (err) => {
              this.saving.set(false);
              this.error.set(
                err.error?.message ||
                  'Cota salva, mas falhou ao atualizar o administrador.',
              );
              this.carregar();
            },
          });
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Erro ao salvar');
        },
      });
  }

  salvarNovo(): void {
    if (this.criarForm.invalid) return;
    const v = this.criarForm.getRawValue();
    this.saving.set(true);
    this.error.set(null);

    this.platform
      .criar({
        nome: v.nome,
        slug: v.slug,
        token_quota_mensal: v.quota_ilimitada ? undefined : v.token_quota_mensal,
        quota_ilimitada: v.quota_ilimitada,
        clonar_cardapio_modelo: v.clonar_cardapio_modelo,
      })
      .subscribe({
        next: (restaurante) => {
          this.platform
            .criarAdminRestaurante(restaurante.id, {
              nome: v.admin_nome,
              email: v.admin_email,
              senha: v.admin_senha,
            })
            .subscribe({
              next: () => {
                this.saving.set(false);
                this.fecharDialog();
                this.carregar();
                this.carregarMetricas();
              },
              error: (err) => {
                this.saving.set(false);
                this.error.set(
                  err.error?.message ||
                    'Restaurante criado, mas falhou ao criar o admin. Edite o restaurante para definir o login.',
                );
                this.carregar();
                this.carregarMetricas();
              },
            });
        },
        error: (err) => {
          this.saving.set(false);
          this.error.set(err.error?.message || 'Erro ao criar restaurante');
        },
      });
  }

  usoLabel(r: RestauranteTenant): string {
    if (r.quota_ilimitada) {
      return `${r.percentual_uso}% (ilimitado · exib. ×10)`;
    }
    return `${r.percentual_uso}% · ${r.tokens_usados_mes.toLocaleString('pt-BR')} / ${r.tokens_quota_efetiva.toLocaleString('pt-BR')} tokens`;
  }

  private atualizarCharts(tenant: PlatformMetricasTenant): void {
    this.conversasChart.set(
      this.toBars(tenant.metricas, (m) => m.total_conversas),
    );
    this.tokensChart.set(
      this.toBars(
        tenant.metricas,
        (m) => m.tokens_consumidos_input + m.tokens_consumidos_output,
      ),
    );
  }

  private toBars(
    rows: MetricaIaDia[],
    pick: (m: MetricaIaDia) => number,
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

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
