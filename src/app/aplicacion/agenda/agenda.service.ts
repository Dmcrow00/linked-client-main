import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HorarioHabitual, HorarioHabitualInput } from 'src/app/models/horarios-tatuador/horario-habitual';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private apiUrl = `${environment.urlApi}agenda`;

  constructor(private http: HttpClient) { }

  //Metodos del tatuador
  getHorarioHabitual(): Observable<HorarioHabitual[]> {
    return this.http.get<HorarioHabitual[]>(`${this.apiUrl}/horario-habitual`);
  }

  // Reemplaza el horario completo: los días que no se envían quedan sin atención.
  updateHorarioHabitual(horarios: HorarioHabitualInput[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/horario-habitual`, { horarios });
  }

  // Metodos del cliente

  getHorariosDisponibles(tatuadorId: number, fecha: Date): Observable<string[]> {
    const fechaISO = fecha.toISOString().split('T')[0];
    const params = new HttpParams().set('fecha', fechaISO);
    return this.http
      .get<{ slots: string[] }>(`${this.apiUrl}/${tatuadorId}/slots-dia`, { params })
      .pipe(map(res => res.slots));
  }

  getFechasBloqueadas(tatuadorId: number, desde: Date, hasta: Date): Observable<string[]> {
    const params = new HttpParams()
      .set('desde', desde.toISOString().split('T')[0])
      .set('hasta', hasta.toISOString().split('T')[0]);
    return this.http.get<string[]>(`${this.apiUrl}/${tatuadorId}/fechas-bloqueadas`, { params });
  }

}
