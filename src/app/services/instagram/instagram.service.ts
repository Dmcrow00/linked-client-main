import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface InstagramStatus {
  connected: boolean;
  instagramUserId?: string;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstagramService {
  private http = inject(HttpClient);


  private apiUrl = `${environment.urlApi}instagram`;

  /** Redirige el navegador al flujo OAuth de Meta (NO es una llamada HTTP interna) */
  connectInstagram(tatuadorId: number, token: string): void {
    window.location.href = `${this.apiUrl}/auth?tatuadorId=${tatuadorId}&token=${encodeURIComponent(token)}`;
  }

  /** Obtiene el estado de vinculación de Instagram del tatuador autenticado */
  getStatus(): Observable<InstagramStatus> {
    return this.http.get<InstagramStatus>(`${this.apiUrl}/status`);
  }

  /** Importa los posts de Instagram del tatuador como Trabajos */
  syncPosts(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sync`, {});
  }

  /** Desvincula la cuenta de Instagram */
  disconnect(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/disconnect`);
  }
}
