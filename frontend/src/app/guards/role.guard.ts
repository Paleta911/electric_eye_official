import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const url = state.url;

    console.log(`🔐 RoleGuard - Token: ${token}, Role: ${role}, URL: ${url}`);

    if (!token) {
      console.warn('⛔ No hay token, redirigiendo al login');
      this.router.navigate(['/']);
      return false;
    }

    if (url.startsWith('/panel-admin') && role !== 'admin') {
      console.warn(`⛔ Acceso denegado. Rol: ${role} Ruta: ${url}`);
      this.router.navigate(['/']);
      return false;
    }

    if (url.startsWith('/panel-usuario') && role !== 'user') {
      console.warn(`⛔ Acceso denegado. Rol: ${role} Ruta: ${url}`);
      this.router.navigate(['/']);
      return false;
    }

    // ✅ Acceso permitido
    return true;
  }
}
