import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
    return this.http.get<ApiResponse<Tatuador[]>>(`${environment.urlApi}users/tatuadores`).pipe(map(unwrap));
  }

  /** Perfil público de un tatuador: no requiere sesión ni trae datos personales. */
  getPerfilPublico(userId: number): Observable<Tatuador> {
    return this.http.get<ApiResponse<Tatuador>>(`${environment.urlApi}users/${userId}/publico`).pipe(map(unwrap));
  }

  getEspecialidadesTatuador(userId: number): Observable<Especialidad[]>  {
    return this.http.get<ApiResponse<Especialidad[]>>(`${this.apiUrl}/${userId}/especialidades`).pipe(map(unwrap));
  }

  assignEspecialidades(userId: number, especialidadIds: number[]): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/${userId}/asignar-especialidades`, especialidadIds).pipe(map(unwrap));
  }

  removeEspecialidad(userId: number, especialidadId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${userId}/quitar-especialidad/${especialidadId}`).pipe(map(unwrap));
  }
}
