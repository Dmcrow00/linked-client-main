import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private endpoint = `${environment.urlApi}solicitudes-tatuador`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SolicitudTatuador[]> {
    return this.http.get<SolicitudTatuador[]>(this.endpoint);
  }

  aprobar(id: number): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}/aprobar`, {});
  }

  rechazar(id: number, notas?: string): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}/rechazar`, { notas });
  }
}
