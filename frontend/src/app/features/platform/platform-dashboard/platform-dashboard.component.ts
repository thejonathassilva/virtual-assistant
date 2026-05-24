import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RestauranteTenant } from '../../../core/models';
import { PlatformService } from '../../../core/services/platform.service';
import { MATERIAL_IMPORTS } from '../../../shared/material';

type DialogMode = 'criar' | 'editar' | null;

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe, ...MATERIAL_IMPORTS],
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
  });

  criarForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    token_quota_mensal: [500_000, [Validators.required, Validators.min(1000)]],
    quota_ilimitada: [false],
    criar_admin: [true],
    admin_nome: ['Administrador', Validators.required],
    admin_email: ['', [Validators.required, Validators.email]],
    admin_senha: ['Restaurante@123', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.carregar();
    this.criarForm.controls.nome.valueChanges.subscribe((nome) => {
      if (!this.slugManual() && this.dialogMode() === 'criar') {
        this.criarForm.controls.slug.setValue(this.slugify(nome), {
          emitEvent: false,
        });
      }
    });
    this.criarForm.controls.criar_admin.valueChanges.subscribe((checked) => {
      this.toggleAdminFields(!!checked);
    });
  }

  carregar(): void {
    this.loading.set(true);
    this.platform.listar().subscribe({
      next: (rows) => {
        this.restaurantes.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  abrirCriar(): void {
    this.error.set(null);
    this.slugManual.set(false);
    this.criarForm.reset({
      nome: '',
      slug: '',
      token_quota_mensal: 500_000,
      quota_ilimitada: false,
      criar_admin: true,
      admin_nome: 'Administrador',
      admin_email: '',
      admin_senha: 'Restaurante@123',
    });
    this.toggleAdminFields(true);
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
    });
    this.onIlimitadoChange(r.quota_ilimitada);
    this.dialogMode.set('editar');
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

  salvarCota(): void {
    const r = this.editando();
    if (!r || this.cotaForm.invalid) return;
    const raw = this.cotaForm.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.platform
      .atualizar(r.id, {
        token_quota_mensal: raw.quota_ilimitada ? undefined : raw.token_quota_mensal,
        quota_ilimitada: raw.quota_ilimitada,
        ativo: raw.ativo,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.fecharDialog();
          this.carregar();
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
      })
      .subscribe({
        next: (restaurante) => {
          if (!v.criar_admin) {
            this.saving.set(false);
            this.fecharDialog();
            this.carregar();
            return;
          }
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
              },
              error: (err) => {
                this.saving.set(false);
                this.error.set(
                  err.error?.message ||
                    'Restaurante criado, mas falhou ao criar o admin. Crie o usuário manualmente.',
                );
                this.carregar();
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

  private toggleAdminFields(enabled: boolean): void {
    const fields = [
      this.criarForm.controls.admin_nome,
      this.criarForm.controls.admin_email,
      this.criarForm.controls.admin_senha,
    ] as AbstractControl[];
    for (const c of fields) {
      if (enabled) c.enable();
      else c.disable();
    }
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
