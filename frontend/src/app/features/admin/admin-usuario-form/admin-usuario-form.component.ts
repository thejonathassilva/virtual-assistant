import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { UserRole } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';

const ROLES: UserRole[] = ['admin', 'cozinha', 'garcom', 'caixa'];

@Component({
  selector: 'app-admin-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-usuario-form.component.html',
  styleUrl: './admin-usuario-form.component.scss',
})
export class AdminUsuarioFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly admin = inject(AdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly roles = ROLES;
  usuarioId = signal<string | null>(null);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['garcom' as UserRole, Validators.required],
    senha: [''],
    ativo: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.usuarioId.set(id);
      this.admin.getUsuario(id).subscribe((u) => {
        this.form.patchValue({
          nome: u.nome,
          email: u.email,
          role: u.role,
          ativo: u.ativo,
        });
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const id = this.usuarioId();
    const body = {
      nome: v.nome,
      email: v.email,
      role: v.role,
      ativo: v.ativo,
      ...(v.senha ? { senha: v.senha } : {}),
    };

    if (!id && !v.senha) {
      this.error.set('Senha obrigatória para novo usuário (mín. 8 caracteres)');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const req = id
      ? this.admin.atualizarUsuario(id, body)
      : this.admin.criarUsuario(body);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err.error?.message || 'Erro ao salvar');
      },
    });
  }
}
