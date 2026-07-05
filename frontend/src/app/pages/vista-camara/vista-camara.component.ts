import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Hls from 'hls.js';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-vista-camara',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vista-camara.component.html',
  styleUrl: './vista-camara.component.css'
})
export class VistaCamaraComponent implements AfterViewInit {
  @ViewChild('videoPlayer') videoRef!: ElementRef<HTMLVideoElement>;
  camaraId!: number;

  constructor(private route: ActivatedRoute) {
    this.camaraId = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    const streamURL = `http://localhost:8888/cam${this.camaraId}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamURL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamURL;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  }
}
