import { HttpInterceptorFn } from '@angular/common/http';

const MESA_TENANT_KEY = 'mesa_restaurante_id';

export function setMesaRestauranteId(id: string | null): void {
  if (id) {
    sessionStorage.setItem(MESA_TENANT_KEY, id);
  } else {
    sessionStorage.removeItem(MESA_TENANT_KEY);
  }
}

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tid = sessionStorage.getItem(MESA_TENANT_KEY);
  if (tid && req.url.startsWith('/api')) {
    return next(
      req.clone({
        setHeaders: { 'x-restaurante-id': tid },
      }),
    );
  }
  return next(req);
};
