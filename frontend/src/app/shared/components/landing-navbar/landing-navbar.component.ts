import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { API_ENDPOINTS } from '../../../core/config/api';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  templateUrl: './landing-navbar.component.html',
  styleUrls: ['./landing-navbar.component.css'],
  imports: [CommonModule, RouterLink, RouterLinkActive]
})
export class LandingNavbarComponent implements OnInit {
  estaLogueado = false;
  menuAbierto = false;
  mensajeError = '';

  constructor(
    private readonly auth: AuthService,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.estaLogueado = this.auth.estaAutenticado();
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  irAlPanel(): void {
    this.mensajeError = '';
    this.http.get<{ servicioActivo: boolean; role: 'user' | 'admin' }>(API_ENDPOINTS.currentUser).subscribe({
      next: user => {
        this.auth.guardarSesion(this.auth.obtenerToken()!, user.role);
        this.cerrarMenu();
        if (!user.servicioActivo) void this.router.navigate(['/activar-servicio']);
        else void this.router.navigate([user.role === 'admin' ? '/panel-admin' : '/panel-usuario']);
      },
      error: () => {
        this.auth.eliminarSesion();
        this.estaLogueado = false;
        this.mensajeError = 'Tu sesión expiró. Inicia sesión nuevamente.';
      }
    });
  }

  cerrarSesion(): void {
    this.auth.eliminarSesion();
    this.estaLogueado = false;
    this.cerrarMenu();
    void this.router.navigate(['/']);
  }
}
