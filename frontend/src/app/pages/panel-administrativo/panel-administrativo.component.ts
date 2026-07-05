import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-panel-administrativo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './panel-administrativo.component.html',
  styleUrls: ['./panel-administrativo.component.css']
})
export class PanelAdministrativoComponent implements OnInit {
  isCollapsed = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.isCollapsed) {
        this.isCollapsed = false; // ✅ Se expande automáticamente al cambiar de ruta
      }
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
