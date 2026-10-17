import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user/user.service';
import { LoginService } from 'src/app/services/auth/login.service';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { TatuadorService } from 'src/app/services/user/tatuador.service';
import { TatuadorComponent } from './tatuador/tatuador.component';
import { MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { ServerUrlPipe } from '../../pipes/server-url.pipe';
import { InstagramService, InstagramStatus } from '../../services/instagram/instagram.service';
import { GeocodingService, GeoResult } from '../../services/geocoding/geocoding.service';
import { ForgotPasswordService } from 'src/app/services/auth/forgotpass.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { AvisosService } from 'src/app/core/avisos.service';
import { apiErrorMessage } from '@dmcrow00/ng-core/http';


@Component({
    selector: 'app-personal-details',
    templateUrl: './personal-details.component.html',
    styleUrls: ['./personal-details.component.scss'],
    providers: [DatePipe],
    imports: [MatChipsModule, MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatDivider, MatCardContent, MatChip, MatCardActions, MatIcon, MatIconButton, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatHint, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, TatuadorComponent, MatButton, DatePipe, ServerUrlPipe, MatSnackBarModule, MatProgressSpinner, MatTooltip, MatAutocompleteModule, NoDoubleSubmitDirective]
})
export class PersonalDetailsComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private tatuadorService = inject(TatuadorService);
  private formBuilder = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private instagramService = inject(InstagramService);
  private geocodingService = inject(GeocodingService);
  private forgotPasswordService = inject(ForgotPasswordService);
  private avisos = inject(AvisosService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(TatuadorComponent) tatuadorComponentRef!: TatuadorComponent;

  previewImageUrl: string | ArrayBuffer | null = null;
  environment = '';
  errorMessage = '';
  userId: number | null = null;
  user?: User;
  userLoginOn = false;
  editMode = false;
  userRol: string | null = null;
  especialidades: Especialidad[] = [];
  today: Date = new Date();
  selectedFile: File | null = null;
  private subscriptions: Subscription = new Subscription();

  // Cambio de contraseña
  showPasswordConfirm = false;
  passwordResetLoading = false;

  // Instagram
  instagramStatus: InstagramStatus = { connected: false };
  instagramLoading = false;
  instagramLoadingMessage = '';
  instagramMessage = '';
  instagramMessageIsError = false;
  showInstagramWarning = false;

  registerForm = this.formBuilder.group({
    id: this.formBuilder.control<number | null>(null),
    surname: this.formBuilder.control<string | null>(null),
    realname: this.formBuilder.control<string | null>(null),
    username: this.formBuilder.control<string | null>(null, Validators.required),
    email: this.formBuilder.control<string | null>(null, Validators.required),
    birthDate: this.formBuilder.control<Date | null>(null, Validators.required),
    profileImage: this.formBuilder.control<File | null>(null),
    localidad: this.formBuilder.control<string | null>(null),
    instagramHandle: this.formBuilder.control<string | null>(null),
  });

  // Coordenadas geocodificadas, no en el formulario reactive sino como propiedades
  geocodedLat: number | null = null;
  geocodedLng: number | null = null;
  geocodedDisplayName: string | null = null;
  isGeocoding = false;
  isGPSLocating = false;
  locationSuggestions: GeoResult[] = [];

  ngOnInit(): void {
    this.loadUserSession();
    this.watchLoginState();
    this.handleInstagramCallback();
    this.subscriptions.add(
      this.registerForm.get('localidad')!.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((q): q is string => typeof q === 'string' && q.length >= 3),
        switchMap(q => this.geocodingService.suggestions(q))
      ).subscribe(results => {
        this.locationSuggestions = results;
      })
    );
  }

  // ----------------------------------------------------------
  // Cambio de contraseña
  // ----------------------------------------------------------

  requestPasswordChange(): void {
    this.showPasswordConfirm = true;
  }

  cancelPasswordChange(): void {
    this.showPasswordConfirm = false;
  }

  confirmPasswordChange(): void {
    if (!this.user?.email) return;
    this.passwordResetLoading = true;
    this.forgotPasswordService.forgotPassword(this.user.email).subscribe({
      next: () => {
        this.passwordResetLoading = false;
        this.showPasswordConfirm = false;
        this.avisos.success(`Se envió un correo a ${this.user!.email} con el enlace para cambiar la contraseña.`);
      },
      error: (err) => {
        this.passwordResetLoading = false;
        this.avisos.fallo(err, 'Error al enviar el correo. Intentá de nuevo.');
      }
    });
  }

  // ----------------------------------------------------------
  // Instagram
  // ----------------------------------------------------------

  private handleInstagramCallback(): void {
    const igParam = this.route.snapshot.queryParamMap.get('instagram');
    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (igParam === 'success') {
      this.instagramMessage = 'Instagram vinculado correctamente.';
      this.instagramMessageIsError = false;
    } else if (igParam === 'denied') {
      this.instagramMessage = 'Vinculación cancelada.';
      this.instagramMessageIsError = false;
    } else if (igParam === 'error') {
      this.instagramMessageIsError = true;
      if (reason === 'no_business_account') {
        this.instagramMessage =
          'Tu cuenta de Instagram no es de tipo Creador ni Empresa. ' +
          'Convertí tu cuenta desde la app de Instagram antes de intentar vincularla.';
      } else {
        this.instagramMessage = 'Ocurrió un error al vincular tu cuenta de Instagram. Intentá de nuevo.';
      }
    }

    if (igParam) {
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }
  }

  private loadInstagramStatus(): void {
    this.instagramService.getStatus().subscribe({
      next: (status) => (this.instagramStatus = status),
      error: () => (this.instagramStatus = { connected: false })
    });
  }

  connectInstagram(): void {
    this.showInstagramWarning = true;
  }

  confirmConnectInstagram(): void {
    this.showInstagramWarning = false;
    if (this.userRol !== 'Tatuador') {
      this.instagramMessage = 'Solo los tatuadores pueden vincular su cuenta de Instagram.';
      this.instagramMessageIsError = true;
      return;
    }
    if (this.userId) {
      this.instagramService.connectInstagram(this.userId, this.loginService.userToken);
    }
  }

  cancelConnectInstagram(): void {
    this.showInstagramWarning = false;
  }

  syncInstagramPosts(): void {
    this.instagramLoading = true;
    this.instagramLoadingMessage = 'Sincronizando posts...';
    this.instagramMessage = '';
    this.instagramService.syncPosts().subscribe({
      next: () => {
        this.instagramMessage = 'Publicaciones sincronizadas.';
        this.instagramMessageIsError = false;
        this.instagramLoading = false;
        if (this.userId) this.loadUserData(this.userId);
      },
      error: (err) => {
        this.instagramMessage = apiErrorMessage(err, 'Error al sincronizar los posts.');
        this.instagramMessageIsError = true;
        this.instagramLoading = false;
        this.loadInstagramStatus();
      }
    });
  }

  disconnectInstagram(): void {
    this.instagramLoading = true;
    this.instagramLoadingMessage = 'Desvinculando cuenta...';
    this.instagramService.disconnect().subscribe({
      next: () => {
        this.instagramStatus = { connected: false };
        this.instagramMessage = 'Cuenta de Instagram desvinculada.';
        this.instagramLoading = false;
        if (this.userId) this.loadUserData(this.userId);
      },
      error: (err) => {
        this.instagramMessage = apiErrorMessage(err, 'Error al desvincular.');
        this.instagramLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadUserSession(): void {
    this.userService.getUserId().subscribe((id) => {
      this.userId = id;
      if (id) this.loadUserData(id);
    });
  }

  private watchLoginState(): void {
    this.subscriptions.add(
      this.loginService.userLoginOn.subscribe((logged) => {
        this.userLoginOn = logged;
        if (!logged) this.router.navigate(['/inicio']);
      })
    );
  }

  // ----------------------------------------------------------
  // Cargar datos del usuario
  // ----------------------------------------------------------
  private loadUserData(id: number): void {
    this.userService.getUser(id).subscribe({
      next: (data) => {
        this.user = data;
        this.registerForm.patchValue({
          surname: data.surname ?? '',
          realname: data.realname ?? '',
          username: data.username ?? '',
          email: data.email ?? '',
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          localidad: data.localidad ?? '',
          instagramHandle: data.instagramHandle ?? '',
        }, { emitEvent: false });
        // Restaurar coordenadas previas si existen
        this.geocodedLat = data.lat ?? null;
        this.geocodedLng = data.lng ?? null;
        this.geocodedDisplayName = data.localidad ?? null;
        this.loadUserRol();
        this.loadEspecialidades();
      },
      error: (err) => (this.errorMessage = apiErrorMessage(err, 'Error al cargar datos')),
    });
  }

  private loadEspecialidades(): void {
  if (!this.userId || !this.user) {
    return;
  }

  this.tatuadorService.getEspecialidadesTatuador(this.userId).subscribe({
      next: (res) => {
        if (this.user) { 
            this.user.especialidades = res;
        }
      },
      error: () => {
          if(this.user) {
              this.user.especialidades = [];
          }
      }
  });
  }

  private loadUserRol(): void {
    this.subscriptions.add(
      this.loginService.userRol.subscribe({
        next: (role) => {
          this.userRol = role;
          if (role === 'Tatuador') this.loadInstagramStatus();
        },
      })
    );
  }

  /* ── Geocodificación ── */

  onLocationSelected(event: MatAutocompleteSelectedEvent): void {
    const selected = this.locationSuggestions.find(s => s.displayName === event.option.value);
    if (selected) {
      this.geocodedLat = selected.lat;
      this.geocodedLng = selected.lng;
      this.geocodedDisplayName = selected.displayName;
    }
    this.locationSuggestions = [];
  }

  verificarLocalidad(): void {
    const query = this.registerForm.get('localidad')?.value?.trim();
    if (!query) return;
    this.isGeocoding = true;
    this.geocodingService.geocode(query).subscribe(result => {
      this.isGeocoding = false;
      if (result) {
        this.geocodedLat = result.lat;
        this.geocodedLng = result.lng;
        this.geocodedDisplayName = result.displayName;
        this.avisos.success(`Ubicación encontrada: ${result.displayName.split(',').slice(0, 2).join(',')}`);
      } else {
        this.geocodedLat = null;
        this.geocodedLng = null;
        this.geocodedDisplayName = null;
        this.avisos.error('No se encontró esa localidad. Intentá con un nombre más específico.');
      }
    });
  }

  usarGPS(): void {
    if (!navigator.geolocation) {
      this.avisos.error('Tu navegador no soporta geolocalización.');
      return;
    }
    this.isGPSLocating = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.geocodingService.reverseGeocode(pos.coords.latitude, pos.coords.longitude).subscribe(result => {
          this.isGPSLocating = false;
          if (result) {
            this.geocodedLat = result.lat;
            this.geocodedLng = result.lng;
            this.geocodedDisplayName = result.displayName;
            this.registerForm.patchValue({ localidad: result.displayName }, { emitEvent: false });
            this.avisos.success(`Ubicación detectada: ${result.displayName.split(',').slice(0, 2).join(',')}`);
          } else {
            this.isGPSLocating = false;
            this.avisos.error('No se pudo determinar tu ubicación.');
          }
        });
      },
      () => {
        this.isGPSLocating = false;
        this.avisos.error('No se pudo obtener el GPS. Verificá los permisos del navegador.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  /** Manejo del archivo seleccionado */
 
  get isPhotoBlockedByInstagram(): boolean {
    return this.userRol === 'Tatuador' && this.instagramStatus.connected;
  }

  triggerFileInput(): void {
    if (this.isPhotoBlockedByInstagram) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 3;

    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Solo se permiten imágenes JPG, PNG o WEBP.';
      this.previewImageUrl = null;
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      this.errorMessage = `El archivo no puede superar ${maxSizeMB}MB.`;
      this.previewImageUrl = null;
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    // Vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // ----------------------------------------------------------
  // Guardar cambios (todos los endpoints)
  // ----------------------------------------------------------

  onUpdateProfile(): void {
  if (!this.userId || !this.user) {
    return;
  }

  if (this.registerForm.invalid) {
    return;
  }

    const requests = [];

    // 1. Actualizar datos del usuario
  const formValues = this.registerForm.value;

  let tatuadorData: { estudio?: string | null, fechaInicioActividad?: Date | null } = {
    estudio: this.user?.estudio ?? null,
    fechaInicioActividad: this.user?.fechaInicioActividad ? new Date(this.user.fechaInicioActividad) : null,
    };

    if (this.userRol === 'Tatuador' && this.tatuadorComponentRef) {
        tatuadorData = this.tatuadorComponentRef.getTatuadorData();
    }

  // El backend sólo toma los campos editables del perfil: username y email no se actualizan por acá.
  const updatedUser: Partial<User> = {
    realname: formValues.realname ?? undefined,
    surname: formValues.surname ?? undefined,
    birthDate: formValues.birthDate ? this.aFechaIso(formValues.birthDate) : undefined,
    estudio: tatuadorData.estudio ?? undefined,
    fechaInicioActividad: tatuadorData.fechaInicioActividad
      ? this.aFechaIso(tatuadorData.fechaInicioActividad)
      : undefined,
    localidad: formValues.localidad ?? undefined,
    lat: this.geocodedLat ?? undefined,
    lng: this.geocodedLng ?? undefined,
    instagramHandle: formValues.instagramHandle ?? undefined,
  };

    requests.push(this.userService.updateUser(this.userId, updatedUser));

    // 2. Subir imagen si hay nueva y no está bloqueada por Instagram
    if (this.selectedFile && !this.isPhotoBlockedByInstagram) {
      requests.push(this.userService.updateProfilePhoto(this.userId, this.selectedFile));
    }

    // Las especialidades no se guardan desde acá: el backend sólo deja asignarlas a un administrador.

    //  Ejecutar todas las llamadas juntas
    forkJoin(requests).subscribe({
      next: (_responses) => {
        this.editMode = false;
        this.selectedFile = null;
        this.fileInput.nativeElement.value = '';
        this.previewImageUrl = null;
        
        if (this.userId) {
        this.loadUserData(this.userId); 
      }
      },
      error: (err) => {
        this.errorMessage = apiErrorMessage(err, 'Error al guardar los cambios.');
      },
    });
  }

  // ----------------------------------------------------------
  // Cancelar edición
  // ----------------------------------------------------------
  onCancel(): void {
    this.editMode = false;
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.previewImageUrl = null;
    if (this.userId) this.loadUserData(this.userId);
  }

  // El backend espera un LocalDate: se envía la fecha local y no el ISO en UTC, que correría un día.
  private aFechaIso(fecha: Date): string {
    const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
    const dia = `${fecha.getDate()}`.padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  /** Formatea la fecha al escribir */
  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value: string = input.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    input.value = value;
  }

  // Getters de conveniencia
  get realname() { return this.registerForm.controls.realname; }
  get surname() { return this.registerForm.controls.surname; }
  get email() { return this.registerForm.controls.email; }
  get birthDate() { return this.registerForm.controls.birthDate; }
  get username() { return this.registerForm.controls.username; }

}
