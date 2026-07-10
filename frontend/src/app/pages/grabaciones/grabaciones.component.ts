import { Component, OnInit } from '@angular/core';

import { Asistencia, AsistenciaService } from '../../services/asistencia.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grabaciones',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './grabaciones.component.html',
  styleUrls: ['./grabaciones.component.css']
})
export class GrabacionesComponent implements OnInit {
  asistencias: Asistencia[] = [];
  imagenAmpliada: string | null = null;
  cargando = true;
  error = '';

  // Paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;

  // Filtro de búsqueda
  filtroTexto: string = '';

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit(): void {
    this.recargarAsistencias();
  }

  get asistenciasFiltradas(): Asistencia[] {
    const texto = this.filtroTexto.toLowerCase();
    return this.asistencias.filter(item =>
      (item.camera || '').toLowerCase().includes(texto) ||
      (item.area || '').toLowerCase().includes(texto)
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.asistenciasFiltradas.length / this.registrosPorPagina));
  }

  get imagenesPaginadas(): Asistencia[] {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.asistenciasFiltradas.slice(inicio, inicio + this.registrosPorPagina);
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) this.paginaActual++;
  }

  ampliarImagen(url: string): void {
    this.imagenAmpliada = url;
  }

  cerrarModal(): void {
    this.imagenAmpliada = null;
  }

  eliminarAsistencia(imagenUrl: string): void {
    let frameId: string | undefined;
    try {
      frameId = new URL(imagenUrl, window.location.origin).pathname.split('/').pop();
    } catch {
      return;
    }
    if (!frameId) return;

    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta imagen?');
    if (!confirmacion) return;

    this.asistenciaService.deleteAsistencia(frameId).subscribe({
      next: () => this.recargarAsistencias(),
      error: err => console.error('❌ Error al eliminar imagen:', err)
    });
  }

  recargarAsistencias(): void {
    this.cargando = true;
    this.error = '';
    this.asistenciaService.getAsistencias().subscribe({
      next: data => {
        this.asistencias = data;
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudieron cargar las grabaciones.';
      }
    });
  }

  descargarImagen(url: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'captura.jpg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
