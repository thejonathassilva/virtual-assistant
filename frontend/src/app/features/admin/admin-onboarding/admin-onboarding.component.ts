import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService, OnboardingStatus } from '../../../core/services/admin.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { MesasService } from '../../../core/services/mesas.service';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-admin-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-onboarding.component.html',
  styleUrl: './admin-onboarding.component.scss',
})
export class AdminOnboardingComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly catalog = inject(CatalogService);
  private readonly mesas = inject(MesasService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  step = signal(0);
  status = signal<OnboardingStatus | null>(null);
  produtoCount = signal(0);
  mesaCount = signal(0);
  saving = signal(false);

  empresaForm = this.fb.nonNullable.group({
    endereco: ['', Validators.required],
    telefone: ['', Validators.required],
    missao: ['', Validators.required],
    historia: [''],
  });

  ngOnInit(): void {
    this.refresh();
    this.admin.getEmpresa().subscribe((e) => {
      this.empresaForm.patchValue({
        endereco: e.endereco ?? '',
        telefone: e.telefone ?? '',
        missao: e.missao ?? '',
        historia: e.historia ?? '',
      });
    });
  }

  refresh(): void {
    this.admin.getOnboardingStatus().subscribe((s) => {
      this.status.set(s);
      this.produtoCount.set(s.counts.produtos);
      this.mesaCount.set(s.counts.mesas);
      if (s.complete) {
        localStorage.setItem('onboarding_done', '1');
      }
    });
    this.catalog.getProdutos().subscribe((p) => this.produtoCount.set(p.length));
    this.mesas.listar().subscribe((m) => this.mesaCount.set(m.length));
  }

  salvarEmpresa(): void {
    if (this.empresaForm.invalid) return;
    this.saving.set(true);
    this.admin.updateEmpresa(this.empresaForm.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.refresh();
        this.step.set(1);
      },
      error: () => this.saving.set(false),
    });
  }

  concluir(): void {
    localStorage.setItem('onboarding_done', '1');
    this.router.navigate(['/admin']);
  }
}
