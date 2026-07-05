import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistenciaService {
  private apiUrl = 'http://localhost:3000/asistencias';

  constructor(private http: HttpClient) {}

  getAsistencias(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteAsistencia(frameId: string) {
    return this.http.delete(`http://localhost:3000/imagen/${frameId}`);
  }

}
