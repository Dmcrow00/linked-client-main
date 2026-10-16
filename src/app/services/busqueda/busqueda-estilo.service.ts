import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TatuadorUbicacion {
  id: number;
  username: string;
  profilePhoto?: string;
  estudio?: string;
  localidad?: string;
  especialidades?: { id: number; nombre: string }[];
  lat: number;
  lng: number;
  instagramHandle?: string;
  distancia?: number;   // km — calculada en frontend
  matchScore?: number;  // % de coincidencia con estilos detectados
}

export interface BusquedaEstiloResponse {
  // Vacío hasta que el backend incorpore el análisis de estilos con IA.
  estilosDetectados: string[];
  tatuadores: TatuadorUbicacion[];
}

@Injectable({ providedIn: 'root' })
export class BusquedaEstiloService {
  private http = inject(HttpClient);


  private apiUrl = `${environment.urlApi}busqueda`;

  /**
   * Envía imagen(es) al backend para análisis de estilo y obtiene tatuadores sugeridos.
   * El backend combina el análisis de IA con la geolocalización del cliente.
   */
  buscarPorImagen(
    imagenes: File[],
    lat: number,
    lng: number,
    radioKm: number = 50
  ): Observable<BusquedaEstiloResponse> {
    const form = new FormData();
    imagenes.forEach(img => form.append('imagenes', img));
    form.append('lat', lat.toString());
    form.append('lng', lng.toString());
    form.append('radioKm', radioKm.toString());
    return this.http.post<BusquedaEstiloResponse>(`${this.apiUrl}/por-estilo`, form);
  }

  /**
   * Obtiene todos los tatuadores con ubicación (cuando no se usa análisis IA).
   */
  getTatuadoresConUbicacion(): Observable<TatuadorUbicacion[]> {
    return this.http.get<TatuadorUbicacion[]>(`${this.apiUrl}/tatuadores-ubicacion`);
  }

  /** Calcula distancia en km entre dos coordenadas (Haversine). */
  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
