import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

type Camara = {
  id: number;
  ubicacion: string;
  estado: string;
  editando: boolean;
};

@Component({
  selector: 'app-mis-camaras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mis-camaras.component.html',
  styleUrl: './mis-camaras.component.css'
})
export class MisCamarasComponent implements OnInit {
  sedes = [
    { id: 'empresaA', nombre: 'Empresa A' },
    { id: 'edificioB', nombre: 'Edificio B' }
  ];

  sedeSeleccionada = 'empresaA';
  camaras: Camara[] = [];

  imagenCargando: Record<number, boolean> = {};
  imagenError: Record<number, boolean> = {};
  timestamp: number = Date.now();

  vistaCompacta = false;

  todasLasCamaras: Record<string, Camara[]> = {
    empresaA: [
      { id: 1, ubicacion: 'Laboratorio', estado: 'enLinea', editando: false },
      { id: 2, ubicacion: 'Sala de estar', estado: 'fueraDeLinea', editando: false }
    ],
    edificioB: []
  };

  ngOnInit() {
    this.cargarCamaras();
    setInterval(() => this.timestamp = Date.now(), 30000);
  }

  cargarCamaras() {
    this.camaras = this.todasLasCamaras[this.sedeSeleccionada] || [];

    this.imagenCargando = {};
    this.imagenError = {};
    this.camaras.forEach(cam => {
      this.imagenCargando[cam.id] = cam.estado === 'enLinea';
      this.imagenError[cam.id] = false;
    });
  }

  editarUbicacion(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.camaras[index].editando = true;
  }

  guardarUbicacion(index: number, event: MouseEvent) {
    event.stopPropagation();
    this.camaras[index].editando = false;
  }

  getSnapshotUrl(camId: number): string | null {
    return camId === 1 ? `http://localhost:3000/snapshot/1?t=${this.timestamp}` : null;
  }

  alternarVista() {
    this.vistaCompacta = !this.vistaCompacta;
  }

  exportarListado() {
    const datos = this.camaras.map(c => `Cámara ${c.id} - ${c.ubicacion} (${c.estado})`).join('\n');
    const blob = new Blob([datos], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `listado_camaras_${this.sedeSeleccionada}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  agregarCamara() {
    const nuevoId = Math.max(...this.camaras.map(c => c.id), 0) + 1;
    this.camaras.push({
      id: nuevoId,
      ubicacion: 'Nueva ubicación',
      estado: 'fueraDeLinea',
      editando: true
    });
  }

  recargarTodo() {
    this.cargarCamaras();
  }
}
