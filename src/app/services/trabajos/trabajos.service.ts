import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrabajosService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.urlApi}trabajos`;

  getFeed(): Observable<Trabajo[]> {
    return this.http.get<Trabajo[]>(`${this.apiUrl}/feed`);
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

    return this.http.post<Trabajo>(this.apiUrl, formData);
  }

  // Ver Portfolio 
  getTrabajosPorTatuador(tatuadorId: number): Observable<Trabajo[]> {
    return this.http.get<Trabajo[]>(`${this.apiUrl}/tatuador/${tatuadorId}`);
  }

  // Favoritos 
  darLike(trabajoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${trabajoId}/favorito`, {});
  }

  quitarLike(trabajoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${trabajoId}/favorito`);
  }

  getMisLikesIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/mis-favoritos/ids`);
  }

  getTrabajoById(trabajoId: number): Observable<Trabajo> {
    return this.http.get<Trabajo>(`${this.apiUrl}/${trabajoId}`);
  }
}
