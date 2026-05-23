import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Usuario } from '../../../core/models';
import { MATERIAL_IMPORTS } from '../../../shared/material';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  cozinha: 'Cozinha',
  garcom: 'Garçom',
  caixa: 'Caixa',
};

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.scss',
})
export class AdminUsuariosComponent implements OnInit {
  private readonly admin = inject(AdminService);
  usuarios = signal<Usuario[]>([]);
  displayedColumns = ['nome', 'email', 'role', 'ativo', 'acoes'];

  roleLabel(role: string): string {
    return ROLE_LABEL[role] ?? role;
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.admin.listarUsuarios().subscribe((u) => this.usuarios.set(u));
  }

  desativar(u: Usuario): void {
    if (!confirm(`Desativar ${u.nome}?`)) return;
    this.admin.desativarUsuario(u.id).subscribe(() => this.carregar());
  }
}
