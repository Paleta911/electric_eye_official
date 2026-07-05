import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-modal.component.html',
  styleUrl: './video-modal.component.css'
})
export class VideoModalComponent {
  @Input() videoSrc: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  cerrarModal() {
    this.close.emit();
  }
}
