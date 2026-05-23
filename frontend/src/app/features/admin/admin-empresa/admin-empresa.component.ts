import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
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
  private readonly fb = inject(FormBuilder);
  saved = signal(false);

  form = this.fb.nonNullable.group({
    nome: [''],
    missao: [''],
    endereco: [''],
    telefone: [''],
  });

  ngOnInit(): void {
    this.admin.getEmpresa().subscribe((e) => this.form.patchValue(e));
  }

  salvar(): void {
    this.admin.updateEmpresa(this.form.getRawValue()).subscribe(() => this.saved.set(true));
  }
}
