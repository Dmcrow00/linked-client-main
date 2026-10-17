import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, catchError } from 'rxjs';

export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface PhotonResponse {
  features: {
    geometry: { coordinates: [number, number] };
    properties: {
      name?: string;
      housenumber?: string;
      street?: string;
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
      countrycode?: string;
    };
  }[];
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);


  private readonly NOMINATIM = 'https://nominatim.openstreetmap.org';
  private readonly PHOTON = 'https://photon.komoot.io/api';
  private readonly HEADERS = { 'Accept-Language': 'es', 'User-Agent': 'LinkedTattooApp/1.0' };

  /** Convierte un texto (ciudad, dirección) a coordenadas. */
  geocode(query: string): Observable<GeoResult | null> {
    const url = `${this.NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    return this.http.get<NominatimResult[]>(url, { headers: this.HEADERS }).pipe(
      map(results => {
        if (!results || results.length === 0) return null;
        return {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          displayName: results[0].display_name,
        };
      }),
      catchError(() => of(null))
    );
  }

  /** Sugerencias de autocompletado usando Photon API (komoot). */
  suggestions(query: string): Observable<GeoResult[]> {
    if (!query || query.trim().length < 3) return of([]);
    const url = `${this.PHOTON}/?q=${encodeURIComponent(query.trim())}&limit=6`;
    return this.http.get<PhotonResponse>(url).pipe(
      map(res =>
        (res.features ?? []).map(f => {
          const p = f.properties;
          const parts: string[] = [];
          if (p.street && p.housenumber) parts.push(`${p.street} ${p.housenumber}`);
          else if (p.street) parts.push(p.street);
          else if (p.name) parts.push(p.name);
          const locality = p.city || p.town || p.village || '';
          if (locality) parts.push(locality);
          if (p.state) parts.push(p.state);
          if (p.country) parts.push(p.country);
          return {
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            displayName: parts.filter(Boolean).join(', '),
          };
        }).filter(r => r.displayName)
      ),
      catchError(() => of([]))
    );
  }

  /** Convierte coordenadas GPS a nombre de ciudad legible. */
  reverseGeocode(lat: number, lng: number): Observable<GeoResult | null> {
    const url = `${this.NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    return this.http.get<NominatimReverseResult>(url, { headers: this.HEADERS }).pipe(
      map(result => {
        if (!result) return null;
        const addr = result.address;
        const ciudad = addr.city || addr.town || addr.village || '';
        const estado = addr.state || '';
        const pais = addr.country || '';
        const displayName = [ciudad, estado, pais].filter(Boolean).join(', ');
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName,
        };
      }),
      catchError(() => of(null))
    );
  }
}
