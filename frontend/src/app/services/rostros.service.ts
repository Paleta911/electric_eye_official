import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../core/config/api';

export type Rostro = {
  nombre: string;
  puesto: string;
  estado: string;
  timestamp: string;
  rostroUrl: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class RostrosService {
  private readonly apiUrl = API_ENDPOINTS.faces;

  constructor(private http: HttpClient) {}

  getRostros(): Observable<Rostro[]> {
    return this.http.get<Rostro[]>(this.apiUrl);
  }
}
