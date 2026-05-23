import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RestaurantBrandComponent } from '../../../shared/restaurant-brand/restaurant-brand.component';
import { MATERIAL_IMPORTS } from '../../../shared/material';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RestaurantBrandComponent, ...MATERIAL_IMPORTS],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['admin@restaurante.com', [Validators.required, Validators.email]],
    senha: ['Restaurante@123', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, senha } = this.form.getRawValue();
    this.auth.login(email, senha).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigateByUrl(this.auth.homeRouteForRole(res.user.role));
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Falha no login');
      },
    });
  }
}
