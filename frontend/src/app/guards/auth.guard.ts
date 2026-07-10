import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_ENDPOINTS } from '../core/config/api';
import { AuthService } from '../services/auth.service';

type SessionResponse = { role: 'user' | 'admin'; servicioActivo: boolean };

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    if (!this.auth.estaAutenticado()) return of(this.router.createUrlTree(['/login-clave']));

    return this.http.get<SessionResponse>(API_ENDPOINTS.verifySession).pipe(
      map(session => {
        this.auth.guardarSesion(this.auth.obtenerToken()!, session.role);
        return session.servicioActivo
          ? true
          : this.router.createUrlTree(['/activar-servicio']);
      }),
      catchError(() => {
        this.auth.eliminarSesion();
        return of(this.router.createUrlTree(['/login-clave'], { queryParams: { sesion: 'expirada' } }));
      })
    );
  }
}
