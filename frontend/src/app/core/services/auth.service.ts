import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginResponse, UserRole } from '../models';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.loadUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(email: string, senha: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.user.set(res.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: UserRole[]): boolean {
    const u = this.user();
    return !!u && roles.includes(u.role);
  }

  homeRouteForRole(role: UserRole): string {
    const map: Record<UserRole, string> = {
      platform_owner: '/platform',
      admin: '/admin',
      cozinha: '/cozinha',
      garcom: '/garcom',
      caixa: '/caixa',
    };
    return map[role];
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
