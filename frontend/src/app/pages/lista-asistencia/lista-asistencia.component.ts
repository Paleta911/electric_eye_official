import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RostrosService } from '../../services/rostros.service';


@Component({
  selector: 'app-lista-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-asistencia.component.html',
  styleUrls: ['./lista-asistencia.component.css']
})
export class ListaAsistenciaComponent implements OnInit {
  rostros: any[] = [];
  mostrarErrorConexion = false;
  imagenAmpliada: string | null = null;

  // Filtros
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  filtroFecha: string = '';

  // Paginación
  paginaActual: number = 1;
  registrosPorPagina: number = 5;

  constructor(private rostrosService: RostrosService) {}

  ngOnInit(): void {
    this.rostrosService.getRostros().subscribe({
      next: data => {
        this.rostros = data;
        this.mostrarErrorConexion = data.length === 0;
        this.paginaActual = 1;
      },
      error: err => {
        console.error('❌ Error al cargar rostros:', err);
        this.mostrarErrorConexion = true;
      }
    });
  }

  get totalAsistencias(): number {
    return this.rostros.length;
  }

  get presentes(): number {
    return this.rostros.filter(r => r.estado === 'Presente').length;
  }

  get ausentes(): number {
    return this.rostros.filter(r => r.estado === 'Ausente').length;
  }

  ampliarImagen(url: string): void {
    this.imagenAmpliada = url;
  }

  cerrarModal(): void {
    this.imagenAmpliada = null;
  }

  // Filtros aplicados
  get rostrosFiltrados() {
    return this.rostros.filter(rostro => {
      const coincideTexto =
        !this.filtroBusqueda ||
        rostro.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        rostro.puesto.toLowerCase().includes(this.filtroBusqueda.toLowerCase());

      const coincideEstado =
        !this.filtroEstado || rostro.estado === this.filtroEstado;

      const coincideFecha =
        !this.filtroFecha || rostro.timestamp.startsWith(this.filtroFecha);

      return coincideTexto && coincideEstado && coincideFecha;
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.rostrosFiltrados.length / this.registrosPorPagina);
  }

  get paginaDatos() {
    const inicio = (this.paginaActual - 1) * this.registrosPorPagina;
    return this.rostrosFiltrados.slice(inicio, inicio + this.registrosPorPagina);
  }

  cambiarPagina(delta: number) {
    const nueva = this.paginaActual + delta;
    if (nueva >= 1 && nueva <= this.totalPaginas) {
      this.paginaActual = nueva;
    }
  }
}
