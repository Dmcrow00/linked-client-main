import { Injectable } from '@angular/core';
import { Tatuador } from 'src/app/models/tatuador/tatuador.model';

/** Lo que muestra la confirmación de una reserva recién pedida. */
export interface DatosReserva {
  tatuador: Tatuador | null;
  /** ISO 8601. */
  fechaHoraInicio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservaStateService {
  private datosReserva: DatosReserva | null = null;
  private imagenesReferencia: File[] = [];

  setDatos(datos: DatosReserva): void {
    this.datosReserva = datos;
  }

  getDatos(): DatosReserva | null {
    const datos = this.datosReserva;
    this.clear();
    return datos;
  }

  clear(): void {
    this.datosReserva = null;
  }

  setImagenes(files: File[]): void {
    this.imagenesReferencia = [...files];
  }

  getImagenes(): File[] {
    return this.imagenesReferencia;
  }

  clearImagenes(): void {
    this.imagenesReferencia = [];
  }
}
