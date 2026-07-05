import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LandingNavbarComponent } from '../../shared/components/landing-navbar/landing-navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LandingNavbarComponent,
    FooterComponent
  ],
  templateUrl: './landing-layout.component.html',
  styleUrls: ['./landing-layout.component.css']
})
export class LandingLayoutComponent {
  constructor(public router: Router) {}

  mostrarLandingNavbar(): boolean {
    const rutasSinNavbar = [
      '/login-clave',
      '/registro',
      '/activar-servicio'
    ];
    return !rutasSinNavbar.includes(this.router.url);
  }
}
