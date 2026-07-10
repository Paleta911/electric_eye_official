import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../core/config/api';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private readonly apiUrl = apiUrl('/imagenes');

  constructor(private http: HttpClient) {}

  getImagenes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
