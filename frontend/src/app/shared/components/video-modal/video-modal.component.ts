import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [],
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
