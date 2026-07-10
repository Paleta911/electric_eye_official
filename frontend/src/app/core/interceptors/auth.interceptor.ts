import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).obtenerToken();
  const isApiRequest = !environment.apiBaseUrl || req.url.startsWith(environment.apiBaseUrl);

  if (!token || !isApiRequest || req.headers.has('Authorization')) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
