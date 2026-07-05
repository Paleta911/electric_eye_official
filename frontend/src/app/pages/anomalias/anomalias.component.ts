import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-anomalias',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './anomalias.component.html',
  styleUrls: ['./anomalias.component.css']
})
export class AnomaliasComponent {
  isModalOpen = false;
  selectedVideo = '';
  personaModal = '';
  descripcionModal = '';

  anomalias = [
    {
      persona: 'James (profesor)',
      descripcion: 'Fuera de horario laboral',
      hora: '13:30',
      lugar: 'Cafetería',
      detalles: 'Estaba en un área no permitida durante su horario laboral.',
      imagen: 'assets/james.jpg',
      video: 'assets/videos/video1.mp4',
      tipo: 'leve'
    },
    {
      persona: 'Maria (profesora) & Persona no registrada',
      descripcion: 'Pelea',
      hora: '17:22',
      lugar: 'Pasillo 2',
      detalles: 'Fue captada agrediendo físicamente a una persona no registrada.',
      imagen: 'assets/profesora.jpg',
      video: 'assets/videos/video2.mp4',
      tipo: 'critico'
    },
    {
      persona: 'Pedro (alumno)',
      descripcion: 'Acceso a área restringida',
      hora: '09:45',
      lugar: 'Laboratorio',
      detalles: 'Ingresó al laboratorio sin permiso.',
      imagen: 'assets/pedro.jpg',
      video: 'assets/videos/video3.mp4',
      tipo: 'leve'
    },
    {
      persona: 'Grupo de 3 personas',
      descripcion: 'Comportamiento sospechoso',
      hora: '21:15',
      lugar: 'Estacionamiento',
      detalles: 'Se encontraban merodeando en un área restringida de noche.',
      imagen: 'assets/grupo.jpg',
      video: 'assets/videos/video4.mp4',
      tipo: 'critico'
    },
    {
      persona: 'Daniel (guardia)',
      descripcion: 'Ausencia en vigilancia',
      hora: '02:30',
      lugar: 'Caseta de seguridad',
      detalles: 'Ausente más de 30 minutos en su puesto.',
      imagen: 'assets/guardia.jpg',
      video: 'assets/videos/video5.mp4',
      tipo: 'critico'
    }
  ];

  abrirModal(videoSrc: string, persona: string, descripcion: string) {
    this.selectedVideo = videoSrc;
    this.personaModal = persona;
    this.descripcionModal = descripcion;
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.selectedVideo = '';
  }

  get totalEventos(): number {
    return this.anomalias.length;
  }

  get eventosCriticos(): number {
    return this.anomalias.filter(a => a.tipo === 'critico').length;
  }

  get eventosFueraHorario(): number {
    return this.anomalias.filter(a => parseInt(a.hora) >= 20 || parseInt(a.hora) < 7).length;
  }
}
