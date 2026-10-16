import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SolicitudTatuador {
  id: number;
  estudio: string | null;
  // Llega como arreglo JSON serializado, por ejemplo "[1, 3]".
  especialidadesIds: string | null;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  notas: string | null;
  adminUser: string | null;
  creationTimestamp: string;
  user: {
    id: number;
    username: string;
    email: string;
    realname?: string;
    surname?: string;
    localidad?: string;
    especialidades?: { id: number; nombre: string }[];
  };
}

@Injectable({ providedIn: 'root' })
export class SolicitudTatuadorService {
  private http = inject(HttpClient);

  private endpoint = `${environment.urlApi}solicitudes-tatuador`;

  getAll(): Observable<SolicitudTatuador[]> {
    return this.http.get<ApiResponse<SolicitudTatuador[]>>(this.endpoint).pipe(map(unwrap));
  }

  aprobar(id: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.endpoint}/${id}/aprobar`, {}).pipe(map(unwrap));
  }

  rechazar(id: number, notas?: string): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.endpoint}/${id}/rechazar`, { notas }).pipe(map(unwrap));
  }
}
