import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return of(this.router.createUrlTree(['/']));
    }

    return this.http.get<any>('http://localhost:3000/api/usuarios/verificar-sesion', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.pipe(
      map(res => {
        if (res.servicioActivo) {
          return true;
        } else {
          return this.router.createUrlTree(['/']);
        }
      }),
      catchError(err => {
        return of(this.router.createUrlTree(['/']));
      })
    );
  }
}
