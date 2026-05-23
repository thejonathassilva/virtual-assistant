import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (...roles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasRole(...roles)) return true;
    const u = auth.user();
    if (u) return router.createUrlTree([auth.homeRouteForRole(u.role)]);
    return router.createUrlTree(['/login']);
  };
};
