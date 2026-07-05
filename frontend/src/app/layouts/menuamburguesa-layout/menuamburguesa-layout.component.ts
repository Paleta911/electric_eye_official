import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { PanelAdministrativoComponent } from '../../pages/panel-administrativo/panel-administrativo.component';

@Component({
  selector: 'app-menuamburguesa-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, PanelAdministrativoComponent],
  template: `

   <div class="main-container">
        <app-panel-administrativo></app-panel-administrativo>
    <div class="panel-layout">
      <app-navbar></app-navbar>

        <main class="panel-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrls: ['./menuamburguesa-layout.component.css']
})
export class MenuamburguesaLayoutComponent {}
