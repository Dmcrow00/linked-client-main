import { Component, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Reserva } from "src/app/aplicacion/reserva/reserva.model";


@Injectable({
    providedIn: 'root',
})
export class ReservaService{
    private readonly turnosEndpoint = `${environment.urlApi}turnos`;

    constructor(private http: HttpClient){
    }

    // TODO: Spring espera multipart/form-data con @RequestParam individuales — convertir payload a FormData
    createReserva(reserva: Reserva): Observable<Reserva> {
        return this.http.post<Reserva>(`${this.turnosEndpoint}/solicitar`, reserva);
    }

    updateReserva(id: Number, reserva: Reserva): Observable<Reserva> {
        return this.http.put<Reserva>(`${this.turnosEndpoint}/${id}`, reserva);
    }

    getAllReservas(): Observable<Reserva[]>{
        return this.http.get<Reserva[]>(`${this.turnosEndpoint}/mis-reservas-cliente`);
    }

    // TODO: sin equivalente en Spring — endpoint GET /api/turnos/{id} pendiente
    getReserva(id:number): Observable<Reserva>{
        return this.http.get<Reserva>(`${this.turnosEndpoint}/${id}`);
    }

    // TODO: sin equivalente en Spring — endpoint DELETE /api/turnos/{id} pendiente
    deleteReserva(id:number): Observable<Reserva>{
        return this.http.delete<Reserva>(`${this.turnosEndpoint}/${id}`);
    }
}