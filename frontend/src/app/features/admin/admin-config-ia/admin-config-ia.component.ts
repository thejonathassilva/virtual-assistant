import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-admin-config-ia',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-config-ia.component.html',
  styleUrl: './admin-config-ia.component.scss',
})
export class AdminConfigIaComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    prompt_sistema: [''],
    modelo_id: [''],
    temperature: [0.3],
    top_p: [0.9],
    top_k: [50],
    max_tokens: [1024],
  });

  ngOnInit(): void {
    this.admin.getConfigIa().subscribe((c) => this.form.patchValue(c as Record<string, unknown>));
  }

  salvar(): void {
    this.admin.updateConfigIa(this.form.getRawValue() as Record<string, unknown>).subscribe();
  }
}
