import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rostro, RostrosService } from '../../services/rostros.service';

@Component({
  selector: 'app-lista-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-asistencia.component.html',
  styleUrls: ['./lista-asistencia.component.css']
})
export class ListaAsistenciaComponent implements OnInit {
  rostros: Rostro[] = [];
  cargando = true;
  error = '';
  imagenAmpliada: string | null = null;
  filtroBusqueda = '';
  filtroEstado = '';
  filtroFecha = '';
  paginaActual = 1;
  registrosPorPagina = 5;

  constructor(private readonly rostrosService: RostrosService) {}

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.rostrosService.getRostros().subscribe({
      next: data => { this.rostros = data; this.paginaActual = 1; this.cargando = false; },
      error: () => { this.error = 'No se pudieron cargar los registros. Comprueba la conexión e inténtalo de nuevo.'; this.cargando = false; }
    });
  }

  get totalAsistencias(): number { return this.rostros.length; }
  get presentes(): number { return this.rostros.filter(item => item.estado === 'Presente').length; }
  get ausentes(): number { return this.rostros.filter(item => item.estado === 'Ausente').length; }
  ampliarImagen(url: string | null): void { if (url) this.imagenAmpliada = url; }
  cerrarModal(): void { this.imagenAmpliada = null; }

  get rostrosFiltrados(): Rostro[] {
    const search = this.filtroBusqueda.toLowerCase();
    return this.rostros.filter(rostro =>
      (!search || rostro.nombre.toLowerCase().includes(search) || rostro.puesto.toLowerCase().includes(search))
      && (!this.filtroEstado || rostro.estado === this.filtroEstado)
      && (!this.filtroFecha || rostro.timestamp.startsWith(this.filtroFecha))
    );
  }

  get totalPaginas(): number { return Math.max(1, Math.ceil(this.rostrosFiltrados.length / this.registrosPorPagina)); }
  get paginaDatos(): Rostro[] {
    const start = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.rostrosFiltrados.slice(start, start + this.registrosPorPagina);
  }
  cambiarPagina(delta: number): void {
    this.paginaActual = Math.min(this.totalPaginas, Math.max(1, this.paginaActual + delta));
  }
}
