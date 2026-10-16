import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Especialidad, EspecialidadPayload } from './especialidades.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
private http = inject(HttpClient);

private endpoint = `${environment.urlApi}especialidades`;

  createEspecialidad(especialidad: EspecialidadPayload): Observable<Especialidad> {
    return this.http.post<Especialidad>(`${this.endpoint}`, especialidad);
  }

  updateEspecialidad(id: number, especialidad: EspecialidadPayload): Observable<Especialidad> {
    return this.http.put<Especialidad>(`${this.endpoint}/${id}`, especialidad);
  }

  getAllEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(`${this.endpoint}`);
  }

  getEspecialidad(id: number): Observable<Especialidad> {
    return this.http.get<Especialidad>(`${this.endpoint}/${id}`);
  }

  deleteEspecialidad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

}
