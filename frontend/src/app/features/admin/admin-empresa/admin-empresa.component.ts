import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { EmpresaBrandStore } from '../../../core/services/empresa-brand.store';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-admin-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-empresa.component.html',
  styleUrl: './admin-empresa.component.scss',
})
export class AdminEmpresaComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly brand = inject(EmpresaBrandStore);
  private readonly fb = inject(FormBuilder);
  saved = signal(false);

  form = this.fb.nonNullable.group({
    nome: [''],
    missao: [''],
    endereco: [''],
    telefone: [''],
    logo_url: [''],
  });

  ngOnInit(): void {
    this.admin.getEmpresa().subscribe((e) =>
      this.form.patchValue({
        nome: e.nome ?? '',
        missao: e.missao ?? '',
        endereco: e.endereco ?? '',
        telefone: e.telefone ?? '',
        logo_url: e.logo_url ?? '',
      }),
    );
  }

  salvar(): void {
    const raw = this.form.getRawValue();
    const body = {
      ...raw,
      logo_url: raw.logo_url.trim() || null,
    };
    this.admin.updateEmpresa(body).subscribe(() => {
      this.saved.set(true);
      this.brand.applyFromEmpresa(body);
    });
  }
}
