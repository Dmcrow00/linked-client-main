import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Especialidad } from './especialidades.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
private endpoint = `${environment.urlApi}especialidades`;

  constructor(private http: HttpClient) {
  }

  createEspecialidad(especialidad: Especialidad): Observable<Especialidad> {
    return this.http.post<any>(`${this.endpoint}`, especialidad).pipe(map(res => res.data));
  }

  updateEspecialidad(id: number, especialidad: Especialidad): Observable<Especialidad> {
    return this.http.put<any>(`${this.endpoint}/${id}`, especialidad).pipe(map(res => res.data));
  }

  getAllEspecialidades(): Observable<Especialidad[]> {
    return this.http.get<any>(`${this.endpoint}`).pipe(map(res => res.data));
  }

  getEspecialidad(id: number): Observable<Especialidad> {
    return this.http.get<any>(`${this.endpoint}/${id}`).pipe(map(res => res.data));
  }

  deleteEspecialidad(id: number): Observable<Especialidad> {
    return this.http.delete<any>(`${this.endpoint}/${id}`).pipe(map(res => res.data));
  }

}
