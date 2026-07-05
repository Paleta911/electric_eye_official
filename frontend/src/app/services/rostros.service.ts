import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RostrosService {
  // 🔄 Nuevo endpoint con /api
  private apiUrl = 'http://localhost:3000/api/rostros';

  constructor(private http: HttpClient) {}

  getRostros(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
