import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private apiUrl = 'http://localhost:3000/imagenes';

  constructor(private http: HttpClient) {}

  getImagenes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
