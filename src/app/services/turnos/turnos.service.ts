import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TurnoMensaje } from 'src/app/models/turno/turno-mensaje.model';
import { TurnoSesion } from 'src/app/models/turno/turno-sesion.model';
import { environment } from 'src/environments/environment';

export interface SolicitarTurnoDto {
  tatuadorId: number;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  descripcionCliente: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.urlApi}turnos`;

  // El endpoint recibe multipart con cada dato como parte independiente.
  solicitarTurno(datos: SolicitarTurnoDto, files: File[]): Observable<TurnoSesion> {
    const formData = new FormData();
    formData.append('tatuadorId', datos.tatuadorId.toString());
    formData.append('fechaHoraInicio', datos.fechaHoraInicio);
    formData.append('fechaHoraFin', datos.fechaHoraFin);
    formData.append('descripcionCliente', datos.descripcionCliente);

    files.forEach(file => {
      formData.append('imagenes', file, file.name);
    });

    return this.http.post<TurnoSesion>(`${this.apiUrl}/solicitar`, formData);
  }

  getMisTurnos(): Observable<TurnoSesion[]> {
    return this.http.get<TurnoSesion[]>(`${this.apiUrl}/mis-turnos`);
  }

  gestionarTurno(idTurno: number, nuevoEstado: string): Observable<TurnoSesion> {
    return this.http.patch<TurnoSesion>(`${this.apiUrl}/gestionar/${idTurno}`, { estado: nuevoEstado });
  }

  updateTurno(id: number, datos: { fechaHoraInicio?: string; fechaHoraFin?: string; estado?: string }): Observable<TurnoSesion> {
    return this.http.put<TurnoSesion>(`${this.apiUrl}/${id}`, datos);
  }

  getMensajesTurno(turnoId: number): Observable<TurnoMensaje[]> {
    return this.http.get<TurnoMensaje[]>(`${this.apiUrl}/${turnoId}/mensajes`);
  }

  enviarMensaje(turnoId: number, texto: string): Observable<TurnoMensaje> {
    return this.http.post<TurnoMensaje>(`${this.apiUrl}/${turnoId}/mensajes`, { texto });
  }

  getMisTurnosCliente(): Observable<TurnoSesion[]> {
    return this.http.get<TurnoSesion[]>(`${this.apiUrl}/mis-reservas-cliente`);
  }
}
