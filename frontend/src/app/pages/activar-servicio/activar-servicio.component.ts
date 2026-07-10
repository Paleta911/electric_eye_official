import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { API_ENDPOINTS } from '../../core/config/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-activar-servicio',
  standalone: true,
  templateUrl: './activar-servicio.component.html',
  styleUrls: ['./activar-servicio.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ActivarServicioComponent implements OnInit {
  clave = '';
  mensaje = '';
  aviso = '';
  cargando = false;
  exito = false;
  iconos: IconoAnimado[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly auth: AuthService
  ) {
    this.aviso = history.state?.notice || 'La clave es proporcionada por un administrador del sistema.';
  }

  ngOnInit(): void {
    this.iconos = createBackgroundIcons();
    if (!this.auth.estaAutenticado()) void this.router.navigate(['/login-clave']);
  }

  activar(): void {
    const key = this.clave.trim();
    if (this.cargando) return;
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(key)) {
      this.mensaje = 'Introduce una clave de activación válida.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.http.post<{ message: string }>(API_ENDPOINTS.activateAccount, { clave: key }).subscribe({
      next: response => {
        this.cargando = false;
        this.exito = true;
        this.mensaje = response.message;
        void this.router.navigate(['/panel-usuario']);
      },
      error: error => this.handleError(error)
    });
  }

  cerrarSesion(): void {
    this.auth.eliminarSesion();
    void this.router.navigate(['/']);
  }

  private handleError(error: HttpErrorResponse): void {
    this.cargando = false;
    this.exito = false;
    this.mensaje = typeof error.error?.message === 'string' ? error.error.message : 'No se pudo activar el servicio.';
  }
}

interface IconoAnimado { class: string; left: number; duration: number; delay: number; size: number }
function createBackgroundIcons(): IconoAnimado[] {
  const classes = ['fa-camera', 'fa-eye', 'fa-lock', 'fa-video', 'fa-key', 'fa-shield-alt'];
  return Array.from({ length: 24 }, (_, index) => ({
    class: classes[index % classes.length], left: (index * 37) % 100,
    duration: 9 + (index % 5), delay: -(index % 8), size: 16 + (index % 4) * 4
  }));
}
