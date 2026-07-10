import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

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
  private intervalo?: ReturnType<typeof setInterval>;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.modoOscuro = localStorage.getItem('ui_theme') === 'dark';
    document.body.classList.toggle('dark-mode', this.modoOscuro);
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
    this.auth.eliminarSesion();
    this.router.navigateByUrl('/');
  }

  abrirConfiguracion() {
    const role = this.auth.obtenerRol();
    if (role === 'admin') {
      this.router.navigate(['/panel-admin']);
    } else {
      this.router.navigate(['/panel-usuario/configuracion']);
    }
  }

  toggleTema() {
    this.modoOscuro = !this.modoOscuro;
    document.body.classList.toggle('dark-mode', this.modoOscuro);
    localStorage.setItem('ui_theme', this.modoOscuro ? 'dark' : 'light');
  }

  irAlInicio() {
    this.router.navigate(['/']);
  }

  get nombreUsuario(): string {
    return this.auth.obtenerRol() === 'admin' ? 'Administrador' : 'Usuario';
  }
}
