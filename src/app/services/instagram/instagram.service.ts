import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
    return this.http.get<ApiResponse<InstagramStatus>>(`${this.apiUrl}/status`).pipe(map(unwrap));
  }

  /** Importa los posts de Instagram del tatuador como Trabajos */
  syncPosts(): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/sync`, {}).pipe(map(unwrap));
  }

  /** Desvincula la cuenta de Instagram */
  disconnect(): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/disconnect`).pipe(map(unwrap));
  }
}
