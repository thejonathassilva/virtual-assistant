import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { EmpresaBrandStore } from '../../core/services/empresa-brand.store';
import { MATERIAL_IMPORTS } from '../../shared/material';

const PLATFORM_BRAND = 'Facilita Virtual';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ...MATERIAL_IMPORTS],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly brand = inject(EmpresaBrandStore);

  readonly toolbarTitle = computed(() => {
    if (this.auth.user()?.role === 'platform_owner') {
      return PLATFORM_BRAND;
    }
    return this.brand.nome();
  });

  constructor() {
    if (this.auth.user()?.role !== 'platform_owner') {
      this.brand.ensureLoaded();
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
