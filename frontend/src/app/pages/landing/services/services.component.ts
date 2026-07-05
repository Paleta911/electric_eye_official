import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';

// Importar íconos
import {
  faShieldAlt,
  faDoorClosed,
  faClock,
  faVideo,
  faNetworkWired,
  faExclamationTriangle,
  faEye,
  faUserSecret,
  faIdCard,
  faBell,
  faRoute,
  faCalendarCheck,
  faUserCheck,
  faProjectDiagram,
  faTools,
  faTemperatureHigh,
  faBatteryFull,
  faDatabase,
  faLink
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  activeIndex: number | null = null;

  constructor(library: FaIconLibrary) {
    // Registrar TODOS los íconos que uses
    library.addIcons(
      faShieldAlt,
      faDoorClosed,
      faClock,
      faVideo,
      faNetworkWired,
      faExclamationTriangle,
      faEye,
      faUserSecret,
      faIdCard,
      faBell,
      faRoute,
      faCalendarCheck,
      faUserCheck,
      faProjectDiagram,
      faTools,
      faTemperatureHigh,
      faBatteryFull,
      faDatabase,
      faLink
    );
  }

  toggleFAQ(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
