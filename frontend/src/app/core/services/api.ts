import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get<T>(endpoint: string) {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  post<T>(endpoint: string, body: any) {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any) {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  patch<T>(endpoint: string, body: any) {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }
}
