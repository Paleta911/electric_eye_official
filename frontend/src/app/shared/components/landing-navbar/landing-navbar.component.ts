import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  templateUrl: './landing-navbar.component.html',
  styleUrls: ['./landing-navbar.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ]
})
export class LandingNavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('navbar') navbar!: ElementRef;

  estaLogueado = false;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.estaLogueado = this.authService.estaAutenticado();
  }

  ngAfterViewInit() {
    // Si en el futuro necesitas altura, puedes usar:
    const alturaNavbar = this.navbar.nativeElement.offsetHeight;
    // Ya no tocamos document.body.style aquí.
  }

  irAlPanel() {
    this.mensajeError = '';

    const token = this.authService.obtenerToken();
    if (!token) {
      this.mensajeError = 'Debes iniciar sesión primero.';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:3000/api/usuarios/me', { headers }).subscribe({
      next: res => {
        if (res.servicioActivo) {
          this.router.navigate(['/panel-usuario']);
        } else {
          this.router.navigate(['/activar-servicio']);
        }
      },
      error: err => {
        console.error('Error verificando usuario', err);
        if (err.status === 401) {
          this.mensajeError = 'Sesión expirada. Vuelve a iniciar sesión.';
          this.authService.eliminarToken();
          this.estaLogueado = false;
        } else if (err.status === 403) {
          this.mensajeError = 'Token inválido. Vuelve a iniciar sesión.';
          this.authService.eliminarToken();
          this.estaLogueado = false;
        } else {
          this.mensajeError = 'No se pudo validar tu cuenta. Intenta de nuevo.';
        }
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  irALogin() {
    this.router.navigate(['/login-clave']);
  }

  cerrarSesion() {
    console.log('Sesión cerrada');
    this.authService.eliminarToken();
    this.estaLogueado = false;
    this.router.navigate(['/']);
  }
}
