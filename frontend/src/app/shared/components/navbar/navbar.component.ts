import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  fechaActual: string = '';
  mostrarMenuUsuario = false;
  modoOscuro: boolean = false;
  private intervalo: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.actualizarFecha();
    this.intervalo = setInterval(() => this.actualizarFecha(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  actualizarFecha() {
    const fecha = new Date();
    this.fechaActual = fecha.toLocaleString();
  }

  toggleMenuUsuario() {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
  }

  cerrarSesion() {
    console.log('Sesión cerrada');
    localStorage.removeItem('auth_token');
    this.router.navigateByUrl('/');
  }

  abrirConfiguracion() {
    const role = localStorage.getItem('user_role');
    if (role === 'admin') {
      this.router.navigate(['/panel-admin']);
    } else {
      this.router.navigate(['/panel-usuario/configuracion']);
    }
  }

  toggleTema() {
    this.modoOscuro = !this.modoOscuro;
    document.body.classList.toggle('dark-mode', this.modoOscuro);
  }

  recargarDatos() {
    console.log('🔄 Datos actualizados manualmente');
  }

  irAlInicio() {
    this.router.navigate(['/']);
  }
}
