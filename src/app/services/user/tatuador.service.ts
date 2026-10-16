import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { Tatuador } from 'src/app/models/tatuador/tatuador.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TatuadorService {
private http = inject(HttpClient);

private apiUrl = `${environment.urlApi}tatuador`;

  getTatuadores(): Observable<Tatuador[]> {
    return this.http.get<Tatuador[]>(`${environment.urlApi}users/tatuadores`);
  }

  /** Perfil público de un tatuador: no requiere sesión ni trae datos personales. */
  getPerfilPublico(userId: number): Observable<Tatuador> {
    return this.http.get<Tatuador>(`${environment.urlApi}users/${userId}/publico`);
  }

  getEspecialidadesTatuador(userId: number): Observable<Especialidad[]>  {
    return this.http.get<Especialidad[]>(`${this.apiUrl}/${userId}/especialidades`);
  }

  assignEspecialidades(userId: number, especialidadIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/asignar-especialidades`, especialidadIds);
  }

  removeEspecialidad(userId: number, especialidadId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/quitar-especialidad/${especialidadId}`);
  }
}
