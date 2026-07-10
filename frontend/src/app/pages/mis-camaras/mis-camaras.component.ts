import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { apiUrl } from '../../core/config/api';

type Camara = { id: number; ubicacion: string; estado: 'enLinea' | 'fueraDeLinea'; editando: boolean };

@Component({
  selector: 'app-mis-camaras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mis-camaras.component.html',
  styleUrl: './mis-camaras.component.css'
})
export class MisCamarasComponent implements OnInit, OnDestroy {
  readonly sedes = [{ id: 'empresaA', nombre: 'Empresa A' }, { id: 'edificioB', nombre: 'Edificio B' }];
  sedeSeleccionada = 'empresaA';
  camaras: Camara[] = [];
  imagenCargando: Record<number, boolean> = {};
  imagenError: Record<number, boolean> = {};
  snapshotUrls: Record<number, string> = {};
  vistaCompacta = false;
  private refreshTimer?: ReturnType<typeof setInterval>;

  readonly todasLasCamaras: Record<string, Camara[]> = {
    empresaA: [
      { id: 1, ubicacion: 'Laboratorio', estado: 'enLinea', editando: false },
      { id: 2, ubicacion: 'Sala de estar', estado: 'fueraDeLinea', editando: false }
    ],
    edificioB: []
  };

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCamaras();
    this.refreshTimer = setInterval(() => this.recargarVistasPrevias(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.liberarSnapshots();
  }

  cargarCamaras(): void {
    this.liberarSnapshots();
    this.camaras = this.todasLasCamaras[this.sedeSeleccionada] || [];
    this.recargarVistasPrevias();
  }

  cargarVistaPrevia(camId: number): void {
    this.imagenCargando[camId] = true;
    this.imagenError[camId] = false;
    this.http.get(apiUrl(`/snapshot/${camId}`), { responseType: 'blob' }).subscribe({
      next: blob => {
        if (this.snapshotUrls[camId]) URL.revokeObjectURL(this.snapshotUrls[camId]);
        this.snapshotUrls[camId] = URL.createObjectURL(blob);
        this.imagenCargando[camId] = false;
      },
      error: () => {
        this.imagenCargando[camId] = false;
        this.imagenError[camId] = true;
      }
    });
  }

  editarUbicacion(index: number, event: Event): void { event.stopPropagation(); this.camaras[index].editando = true; }
  guardarUbicacion(index: number, event: Event): void { event.stopPropagation(); this.camaras[index].editando = false; }
  alternarVista(): void { this.vistaCompacta = !this.vistaCompacta; }
  agregarCamara(): void {
    const nuevoId = Math.max(...this.camaras.map(camera => camera.id), 0) + 1;
    this.camaras.push({ id: nuevoId, ubicacion: 'Nueva ubicación', estado: 'fueraDeLinea', editando: true });
  }
  recargarTodo(): void { this.cargarCamaras(); }

  exportarListado(): void {
    const data = this.camaras.map(camera => `Cámara ${camera.id} - ${camera.ubicacion} (${camera.estado})`).join('\n');
    const url = URL.createObjectURL(new Blob([data], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `listado_camaras_${this.sedeSeleccionada}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private recargarVistasPrevias(): void {
    for (const camera of this.camaras) {
      if (camera.estado === 'enLinea') this.cargarVistaPrevia(camera.id);
    }
  }

  private liberarSnapshots(): void {
    Object.values(this.snapshotUrls).forEach(url => URL.revokeObjectURL(url));
    this.snapshotUrls = {};
    this.imagenCargando = {};
    this.imagenError = {};
  }
}
