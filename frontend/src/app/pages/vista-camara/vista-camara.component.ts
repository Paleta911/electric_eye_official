import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import Hls from 'hls.js';
import { streamUrl } from '../../core/config/api';

@Component({
  selector: 'app-vista-camara',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './vista-camara.component.html',
  styleUrl: './vista-camara.component.css'
})
export class VistaCamaraComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;
  readonly camaraId: number;
  error = '';
  cargando = true;
  private hls?: Hls;

  constructor(private readonly route: ActivatedRoute) {
    this.camaraId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(this.camaraId) || this.camaraId < 1) {
      this.error = 'La cámara solicitada no es válida.';
      this.cargando = false;
    }
  }

  ngAfterViewInit(): void {
    if (!Number.isInteger(this.camaraId) || this.camaraId < 1) {
      return;
    }

    const video = this.videoRef.nativeElement;
    const source = streamUrl(`/cam${this.camaraId}/index.m3u8`);
    const onReady = () => { this.cargando = false; };
    const onError = () => {
      this.cargando = false;
      this.error = 'La transmisión no está disponible en este momento.';
    };

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(source);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, onReady);
      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) onError();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', onReady, { once: true });
      video.addEventListener('error', onError, { once: true });
    } else {
      onError();
    }
  }

  ngOnDestroy(): void {
    this.hls?.destroy();
  }
}
