import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrabajosService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.urlApi}trabajos`;

  getFeed(): Observable<Trabajo[]> {
    return this.http.get<ApiResponse<Trabajo[]>>(`${this.apiUrl}/feed`).pipe(map(unwrap));
  }

  // Subir Foto 
  subirTrabajo(descripcion: string, files: File[]): Observable<Trabajo> {
    const formData = new FormData();

    formData.append('descripcion', descripcion);

    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('fotos', file, file.name);
      });
    }

    return this.http.post<ApiResponse<Trabajo>>(this.apiUrl, formData).pipe(map(unwrap));
  }

  // Ver Portfolio 
  getTrabajosPorTatuador(tatuadorId: number): Observable<Trabajo[]> {
    return this.http.get<ApiResponse<Trabajo[]>>(`${this.apiUrl}/tatuador/${tatuadorId}`).pipe(map(unwrap));
  }

  // Favoritos 
  darLike(trabajoId: number): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${trabajoId}/favorito`, {}).pipe(map(unwrap));
  }

  quitarLike(trabajoId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${trabajoId}/favorito`).pipe(map(unwrap));
  }

  getMisLikesIds(): Observable<number[]> {
    return this.http.get<ApiResponse<number[]>>(`${this.apiUrl}/mis-favoritos/ids`).pipe(map(unwrap));
  }

  getTrabajoById(trabajoId: number): Observable<Trabajo> {
    return this.http.get<ApiResponse<Trabajo>>(`${this.apiUrl}/${trabajoId}`).pipe(map(unwrap));
  }
}
