import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Especialidad, EspecialidadPayload } from './especialidades.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
private http = inject(HttpClient);

private endpoint = `${environment.urlApi}especialidades`;

  createEspecialidad(especialidad: EspecialidadPayload): Observable<Especialidad> {
    return this.http.post<ApiResponse<Especialidad>>(`${this.endpoint}`, especialidad).pipe(map(unwrap));
  }

  updateEspecialidad(id: number, especialidad: EspecialidadPayload): Observable<Especialidad> {
    return this.http.put<ApiResponse<Especialidad>>(`${this.endpoint}/${id}`, especialidad).pipe(map(unwrap));
  }

  getAllEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<ApiResponse<Especialidad[]>>(`${this.endpoint}`).pipe(map(unwrap));
  }

  getEspecialidad(id: number): Observable<Especialidad> {
    return this.http.get<ApiResponse<Especialidad>>(`${this.endpoint}/${id}`).pipe(map(unwrap));
  }

  deleteEspecialidad(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.endpoint}/${id}`).pipe(map(unwrap));
  }

}
