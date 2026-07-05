import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsistenciaService } from '../../services/asistencia.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grabaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grabaciones.component.html',
  styleUrls: ['./grabaciones.component.css']
})
export class GrabacionesComponent implements OnInit {
  asistencias: any[] = [];
  imagenAmpliada: string | null = null;

  // Paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 10;

  // Filtro de búsqueda
  filtroTexto: string = '';

  constructor(private asistenciaService: AsistenciaService) {}

  ngOnInit(): void {
    this.recargarAsistencias();
  }

  get asistenciasFiltradas(): any[] {
    const texto = this.filtroTexto.toLowerCase();
    return this.asistencias.filter(item =>
      item.camera.toLowerCase().includes(texto) ||
      item.area.toLowerCase().includes(texto)
    );
  }

  get totalPaginas(): number {
    return Math.ceil(this.asistenciasFiltradas.length / this.registrosPorPagina);
  }

  get imagenesPaginadas(): any[] {
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
    const frameId = imagenUrl.split('/').pop();
    if (!frameId) return;

    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta imagen?');
    if (!confirmacion) return;

    this.asistenciaService.deleteAsistencia(frameId).subscribe({
      next: () => this.recargarAsistencias(),
      error: err => console.error('❌ Error al eliminar imagen:', err)
    });
  }

  recargarAsistencias(): void {
    this.asistenciaService.getAsistencias().subscribe({
      next: data => {
        this.asistencias = data;
        this.paginaActual = 1; // Reinicia a la primera página
      },
      error: err => console.error('❌ Error al cargar asistencias:', err)
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
