import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from './core/config/api';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private readonly apiUrl = apiUrl('/videos');

  constructor(private http: HttpClient) {}

  getVideos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
