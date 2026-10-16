import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';

import { TatuadorService } from 'src/app/services/user/tatuador.service';
import {
  BusquedaEstiloService,
  TatuadorUbicacion,
} from 'src/app/services/busqueda/busqueda-estilo.service';
import { ReservaStateService } from 'src/app/services/reserva/reserva-state.service';
import { GeocodingService, GeoResult } from 'src/app/services/geocoding/geocoding.service';
import { ServerUrlPipe } from 'src/app/pipes/server-url.pipe';
import { environment } from 'src/environments/environment';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-buscar-tatuador',
  templateUrl: './buscar-tatuador.component.html',
  styleUrl: './buscar-tatuador.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatAutocompleteModule,
    ServerUrlPipe,
  ],
})
export class BuscarTatuadorComponent implements OnInit, AfterViewInit, OnDestroy {
  private tatuadorService = inject(TatuadorService);
  private busquedaService = inject(BusquedaEstiloService);
  private reservaStateService = inject(ReservaStateService);
  private geocodingService = inject(GeocodingService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private location = inject(Location);


  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  /* ── Estado ── */
  estilosDisponibles: string[] = [];
  estilosSeleccionados = new Set<string>();

  tatuadoresResultado: TatuadorUbicacion[] = [];
  todosLosTatuadores: TatuadorUbicacion[] = [];

  userLat: number | null = null;
  userLng: number | null = null;
  radioKm = 50;
  locationText = '';

  isLocating = false;
  isGeocoding = false;
  errorMsg: string | null = null;

  locationSuggestions: GeoResult[] = [];
  private locationInput$ = new Subject<string>();
  private subscriptions = new Subscription();

  /* ── Mapa ── */
  private map!: L.Map;
  private userMarker?: L.Marker;
  private userCircle?: L.Circle;
  private artistMarkers: L.Marker[] = [];

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.locationInput$.pipe(
        debounceTime(350),
        distinctUntilChanged(),
        filter(q => q.length >= 3),
        switchMap(q => this.geocodingService.suggestions(q))
      ).subscribe(results => {
        this.locationSuggestions = results;
      })
    );
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.cargarTatuadoresMapa();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    this.subscriptions.unsubscribe();
  }

  /* ──────────────────────────────
     MAPA
  ────────────────────────────── */
  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-34.6037, -58.3816],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this.map);
  }

  private colocarMarcadoresArtistas(lista: TatuadorUbicacion[]): void {
    this.artistMarkers.forEach(m => m.remove());
    this.artistMarkers = [];

    lista.forEach(tatuador => {
      const photo = tatuador.profilePhoto;
      const photoUrl = photo
        ? (photo.startsWith('http') ? photo : `${environment.urlImg}${photo}`)
        : 'assets/images/default-avatar.png';

      const icono = L.divIcon({
        className: 'artist-marker-wrapper',
        html: `
          <div class="artist-map-marker">
            <img src="${photoUrl}"
                 onerror="this.src='assets/images/default-avatar.png'"
                 class="marker-avatar">
          </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      const marker = L.marker([tatuador.lat, tatuador.lng], { icon: icono })
        .addTo(this.map)
        .bindPopup(this.buildPopupContent(tatuador));

      marker.on('click', () => {
        this.ngZone.run(() => this.scrollToCard(tatuador.id));
      });

      this.artistMarkers.push(marker);
    });
  }

  private buildPopupContent(t: TatuadorUbicacion): string {
    const esps = (t.especialidades ?? []).slice(0, 3).map(e => e.nombre).join(', ');
    const dist = t.distancia ? `${t.distancia.toFixed(1)} km` : '';
    return `
      <div class="map-popup">
        <strong>@${t.username}</strong>
        ${t.estudio ? `<span class="popup-studio">${t.estudio}</span>` : ''}
        ${esps ? `<span class="popup-esps">${esps}</span>` : ''}
        ${dist ? `<span class="popup-dist"><b>${dist}</b> de distancia</span>` : ''}
      </div>`;
  }

  /* ──────────────────────────────
     GEOLOCALIZACIÓN GPS
  ────────────────────────────── */
  obtenerUbicacion(): void {
    if (!navigator.geolocation) {
      this.snackBar.open('Tu navegador no soporta geolocalización.', 'Cerrar', { duration: 3000 });
      return;
    }
    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.ngZone.run(() => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.locationText = '';
          this.isLocating = false;
          this.centrarMapaEnUsuario();
          this.aplicarFiltros();
        });
      },
      () => {
        this.ngZone.run(() => {
          this.isLocating = false;
          this.snackBar.open('No se pudo obtener tu ubicación. Verifica los permisos.', 'Cerrar', { duration: 4000 });
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  /* ──────────────────────────────
     AUTOCOMPLETADO
  ────────────────────────────── */
  onLocationInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.locationInput$.next(value);
    if (!value || value.length < 3) {
      this.locationSuggestions = [];
    }
  }

  onLocationSelected(event: MatAutocompleteSelectedEvent): void {
    const selected = this.locationSuggestions.find(s => s.displayName === event.option.value);
    if (selected) {
      this.userLat = selected.lat;
      this.userLng = selected.lng;
      this.locationText = selected.displayName;
      this.locationSuggestions = [];
      this.centrarMapaEnUsuario();
      this.aplicarFiltros();
    }
  }

  /* ──────────────────────────────
     GEOCODIFICACIÓN MANUAL
  ────────────────────────────── */
  geocodificarUbicacion(): void {
    const q = this.locationText.trim();
    if (!q) return;
    this.isGeocoding = true;
    this.locationSuggestions = [];

    this.geocodingService.geocode(q).subscribe({
      next: (result) => {
        this.isGeocoding = false;
        if (result) {
          this.userLat = result.lat;
          this.userLng = result.lng;
          this.locationText = result.displayName;
          this.centrarMapaEnUsuario();
          this.aplicarFiltros();
        } else {
          this.snackBar.open('No se encontró la ubicación. Intentá con otro nombre.', 'Cerrar', { duration: 3500 });
        }
      },
      error: () => {
        this.isGeocoding = false;
        this.snackBar.open('Error al buscar la ubicación.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private centrarMapaEnUsuario(): void {
    if (!this.userLat || !this.userLng || !this.map) return;

    if (this.userMarker) this.userMarker.remove();

    const userIcon = L.divIcon({
      className: 'user-marker-wrapper',
      html: `<div class="user-map-marker"><span class="material-icons">my_location</span></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    this.userMarker = L.marker([this.userLat, this.userLng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<b>Tu ubicación</b>')
      .openPopup();

    this.map.setView([this.userLat, this.userLng], 12);

    if (this.userCircle) this.userCircle.remove();
    this.userCircle = L.circle([this.userLat, this.userLng], {
      radius: this.radioKm * 1000,
      color: '#5d6a58',
      fillColor: '#5d6a58',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '6 4',
    }).addTo(this.map);
  }

  actualizarDistancias(): void {
    if (!this.userLat || !this.userLng) return;
    if (this.userCircle) {
      this.userCircle.remove();
      this.userCircle = L.circle([this.userLat, this.userLng], {
        radius: this.radioKm * 1000,
        color: '#5d6a58',
        fillColor: '#5d6a58',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '6 4',
      }).addTo(this.map);
    }
    this.aplicarFiltros();
  }

  /* ──────────────────────────────
     SELECTOR DE ESTILOS
  ────────────────────────────── */
  toggleEstilo(nombre: string): void {
    if (this.estilosSeleccionados.has(nombre)) {
      this.estilosSeleccionados.delete(nombre);
    } else {
      this.estilosSeleccionados.add(nombre);
    }
    this.estilosSeleccionados = new Set(this.estilosSeleccionados);
  }

  isEstiloSeleccionado(nombre: string): boolean {
    return this.estilosSeleccionados.has(nombre);
  }

  /* ──────────────────────────────
     FILTROS
  ────────────────────────────── */
  aplicarFiltros(): void {
    let resultado = [...this.todosLosTatuadores];

    if (this.estilosSeleccionados.size > 0) {
      resultado = resultado.filter(t =>
        (t.especialidades ?? []).some(e => this.estilosSeleccionados.has(e.nombre))
      );
    }

    if (this.userLat && this.userLng) {
      resultado = resultado
        .map(t => ({
          ...t,
          distancia: this.busquedaService.calcularDistancia(this.userLat!, this.userLng!, t.lat, t.lng),
        }))
        .filter(t => (t.distancia ?? 0) <= this.radioKm)
        .sort((a, b) => (a.distancia ?? 999) - (b.distancia ?? 999));
    }

    this.tatuadoresResultado = resultado;
    this.colocarMarcadoresArtistas(resultado);

    if (resultado.length > 0) {
      const bounds = resultado.map(t => [t.lat, t.lng] as L.LatLngTuple);
      this.map?.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }

  /* ──────────────────────────────
     CARGA INICIAL
  ────────────────────────────── */
  private cargarTatuadoresMapa(): void {
    this.tatuadorService.getTatuadores().subscribe({
      next: (tatuadores) => {
        this.todosLosTatuadores = tatuadores
          .filter(t => t.lat != null && t.lng != null)
          .map(t => ({
            id: t.id,
            username: t.username,
            profilePhoto: t.profilePhoto,
            estudio: t.estudio,
            localidad: t.localidad ?? undefined,
            especialidades: t.especialidades ?? [],
            lat: t.lat!,
            lng: t.lng!,
            instagramHandle: t.instagramHandle ?? undefined,
          }));

        const estilosSet = new Set<string>();
        this.todosLosTatuadores.forEach(t =>
          (t.especialidades ?? []).forEach(e => estilosSet.add(e.nombre))
        );
        this.estilosDisponibles = Array.from(estilosSet).sort();

        this.tatuadoresResultado = [...this.todosLosTatuadores];
        if (this.tatuadoresResultado.length > 0) {
          this.colocarMarcadoresArtistas(this.tatuadoresResultado);
          const bounds = this.tatuadoresResultado.map(t => [t.lat, t.lng] as L.LatLngTuple);
          this.map?.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
        }
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los tatuadores.';
      },
    });
  }

  /* ──────────────────────────────
     NAVEGACIÓN
  ────────────────────────────── */
  verPerfil(idUser: number): void {
    this.router.navigate(['/perfil-publico', idUser]);
  }

  reservar(idUser: number): void {
    this.router.navigate(['/reserva/horarios', idUser]);
  }

  private scrollToCard(idUser: number): void {
    const el = document.getElementById(`artist-card-${idUser}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  getInstagramUrl(handle: string): string {
    return `https://www.instagram.com/${handle.replace('@', '')}`;
  }
}
