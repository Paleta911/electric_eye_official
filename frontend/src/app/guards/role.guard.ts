import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../core/config/api';
import { AuthService, UserRole } from '../services/auth.service';

type CurrentUser = { role: UserRole; servicioActivo: boolean };

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  canActivate(_route: unknown, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (!this.auth.estaAutenticado()) return of(this.router.createUrlTree(['/login-clave']));

    return this.http.get<CurrentUser>(API_ENDPOINTS.currentUser).pipe(
      map(user => {
        this.auth.guardarSesion(this.auth.obtenerToken()!, user.role);
        const expectedRole: UserRole = state.url.startsWith('/panel-admin') ? 'admin' : 'user';
        if (user.role === expectedRole) return true;
        return this.router.createUrlTree([user.role === 'admin' ? '/panel-admin' : '/panel-usuario']);
      }),
      catchError(() => {
        this.auth.eliminarSesion();
        return of(this.router.createUrlTree(['/login-clave']));
      })
    );
  }
}
