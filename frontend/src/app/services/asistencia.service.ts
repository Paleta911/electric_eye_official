import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, apiUrl } from '../core/config/api';

export type Asistencia = {
  _id: string;
  timestamp: string;
  camera: string;
  area: string;
  frame_id: string;
  imagenUrl: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private readonly apiUrl = API_ENDPOINTS.attendance;

  constructor(private http: HttpClient) {}

  getAsistencias(): Observable<Asistencia[]> {
    return this.http.get<Asistencia[]>(this.apiUrl);
  }

  deleteAsistencia(frameId: string) {
    return this.http.delete(apiUrl(`/imagen/${encodeURIComponent(frameId)}`));
  }

}
