import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  activeIndex: number | null = null; // Guarda el índice de la pregunta activa

  toggleFAQ(index: number) {
    // Si la misma pregunta se presiona, se cierra. Si es otra, se abre y se cierra la anterior.
    this.activeIndex = this.activeIndex === index ? null : index;
  }


}
