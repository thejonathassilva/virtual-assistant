import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const clienteMesaRoutes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/cliente/mesa-home/mesa-home.component').then((m) => m.MesaHomeComponent),
  },
  {
    path: 'cardapio',
    loadComponent: () =>
      import('./features/cliente/cardapio/cardapio.component').then((m) => m.CardapioComponent),
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/cliente/chat/chat.component').then((m) => m.ChatComponent),
  },
];

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'r/:slug/mesa/:mesaId',
    children: clienteMesaRoutes,
  },
  {
    path: 'mesa/:mesaId',
    loadComponent: () =>
      import('./features/cliente/mesa-legacy-redirect/mesa-legacy-redirect.component').then(
        (m) => m.MesaLegacyRedirectComponent,
      ),
  },
  {
    path: 'mesa/:mesaId/cardapio',
    loadComponent: () =>
      import('./features/cliente/mesa-legacy-redirect/mesa-legacy-redirect.component').then(
        (m) => m.MesaLegacyRedirectComponent,
      ),
  },
  {
    path: 'mesa/:mesaId/chat',
    loadComponent: () =>
      import('./features/cliente/mesa-legacy-redirect/mesa-legacy-redirect.component').then(
        (m) => m.MesaLegacyRedirectComponent,
      ),
  },
  {
    path: 'cozinha',
    canActivate: [authGuard, roleGuard('cozinha', 'admin')],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/cozinha/cozinha-dashboard/cozinha-dashboard.component').then(
            (m) => m.CozinhaDashboardComponent,
          ),
      },
    ],
  },
  {
    path: 'garcom',
    canActivate: [authGuard, roleGuard('garcom', 'admin')],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/garcom/garcom-dashboard/garcom-dashboard.component').then(
            (m) => m.GarcomDashboardComponent,
          ),
      },
    ],
  },
  {
    path: 'caixa',
    canActivate: [authGuard, roleGuard('caixa', 'admin')],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/caixa/caixa-dashboard/caixa-dashboard.component').then(
            (m) => m.CaixaDashboardComponent,
          ),
      },
    ],
  },
  {
    path: 'platform',
    canActivate: [authGuard, roleGuard('platform_owner')],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/platform/platform-dashboard/platform-dashboard.component').then(
            (m) => m.PlatformDashboardComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'onboarding',
        loadComponent: () =>
          import('./features/admin/admin-onboarding/admin-onboarding.component').then(
            (m) => m.AdminOnboardingComponent,
          ),
      },
      {
        path: 'usuarios/novo',
        loadComponent: () =>
          import('./features/admin/admin-usuario-form/admin-usuario-form.component').then(
            (m) => m.AdminUsuarioFormComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/admin-usuarios/admin-usuarios.component').then(
            (m) => m.AdminUsuariosComponent,
          ),
      },
      {
        path: 'usuarios/:id',
        loadComponent: () =>
          import('./features/admin/admin-usuario-form/admin-usuario-form.component').then(
            (m) => m.AdminUsuarioFormComponent,
          ),
      },
      {
        path: 'produtos/novo',
        loadComponent: () =>
          import('./features/admin/admin-produto-form/admin-produto-form.component').then(
            (m) => m.AdminProdutoFormComponent,
          ),
      },
      {
        path: 'produtos',
        loadComponent: () =>
          import('./features/admin/admin-produtos/admin-produtos.component').then(
            (m) => m.AdminProdutosComponent,
          ),
      },
      {
        path: 'produtos/:id',
        loadComponent: () =>
          import('./features/admin/admin-produto-form/admin-produto-form.component').then(
            (m) => m.AdminProdutoFormComponent,
          ),
      },
      {
        path: 'empresa',
        loadComponent: () =>
          import('./features/admin/admin-empresa/admin-empresa.component').then(
            (m) => m.AdminEmpresaComponent,
          ),
      },
      {
        path: 'config-ia',
        loadComponent: () =>
          import('./features/admin/admin-config-ia/admin-config-ia.component').then(
            (m) => m.AdminConfigIaComponent,
          ),
      },
      {
        path: 'mesas',
        loadComponent: () =>
          import('./features/admin/admin-mesas/admin-mesas.component').then(
            (m) => m.AdminMesasComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
