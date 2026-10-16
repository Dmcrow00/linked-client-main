import { Component, NgZone, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RegisterService } from 'src/app/services/auth/register.service';
import { Validators } from '@angular/forms';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';
import { User } from '../auth.models';
import { EncryptionService } from 'src/app/services/auth/encryption.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf, NgFor } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { GeocodingService, GeoResult } from 'src/app/services/geocoding/geocoding.service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { Observable, of, timer } from 'rxjs';
import { EspecialidadesService } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.service';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatIcon, MatFormField, MatPrefix, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgIf, NgFor, MatError, MatIconButton, MatButton, MatProgressSpinner, MatTooltip, MatAutocompleteModule, MatChipsModule, RecaptchaModule, NoDoubleSubmitDirective]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  user: User = new User();
  today: Date = new Date();
  hide = true;

  accountType: 'cliente' | 'tatuador' = 'cliente';
  captchaValid = false;
  captchaToken: string | null = null;

  geocodedLat: number | null = null;
  geocodedLng: number | null = null;
  geocodedDisplayName: string | null = null;
  isGeocoding = false;
  isGPSLocating = false;
  locationSuggestions: GeoResult[] = [];

  especialidades: Especialidad[] = [];
  especialidadesSeleccionadas: Especialidad[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private registerService: RegisterService,
    private dialog: MatDialog,
    private encryptionService: EncryptionService,
    private router: Router,
    private geocodingService: GeocodingService,
    private ngZone: NgZone,
    private especialidadesService: EspecialidadesService,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: ['', [Validators.required], [this.usernameAvailabilityValidator()]],
        realname: [''],
        surname: [''],
        localidad: [''],
        email: ['', [Validators.required, Validators.email], [this.emailAvailabilityValidator()]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordHasUpperCase(),
            this.passwordHasNumber(),
            this.passwordHasLowerCase()
          ],
        ],
        password2: ['', [Validators.required, this.passwordMatchValidator()]],
        birth_date: ['', [Validators.required]],
        estudio: [''],
      }
    );

    this.user = new User();
  }

  ngOnInit(): void {
    this.especialidadesService.getAllEspecialidades().subscribe(data => {
      this.especialidades = data.filter(e => e.status === 'true');
    });

    this.registerForm.get('localidad')!.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((q): q is string => typeof q === 'string' && q.length >= 3),
      switchMap(q => this.geocodingService.suggestions(q))
    ).subscribe(results => {
      this.locationSuggestions = results;
    });

    this.registerForm.get('password')!.valueChanges.subscribe(() => {
      const p2 = this.registerForm.get('password2');
      if (p2?.value) {
        p2.markAsTouched();
        p2.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  setAccountType(type: 'cliente' | 'tatuador'): void {
    this.accountType = type;
    const tatuadorFields = ['realname', 'surname', 'localidad', 'estudio'];

    if (type === 'tatuador') {
      tatuadorFields.forEach(field => {
        this.registerForm.get(field)!.setValidators(Validators.required);
        this.registerForm.get(field)!.updateValueAndValidity();
      });
    } else {
      this.especialidadesSeleccionadas = [];
      tatuadorFields.forEach(field => {
        this.registerForm.get(field)!.clearValidators();
        this.registerForm.get(field)!.updateValueAndValidity();
      });
    }
  }

  toggleEspecialidad(esp: Especialidad): void {
    const idx = this.especialidadesSeleccionadas.findIndex(e => e.id === esp.id);
    if (idx >= 0) {
      this.especialidadesSeleccionadas.splice(idx, 1);
    } else {
      this.especialidadesSeleccionadas.push(esp);
    }
  }

  isEspecialidadSelected(esp: Especialidad): boolean {
    return this.especialidadesSeleccionadas.some(e => e.id === esp.id);
  }

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
      } else {
        this.geocodedLat = null;
        this.geocodedLng = null;
        this.geocodedDisplayName = null;
      }
    });
  }

  usarGPS(): void {
    if (!navigator.geolocation) return;
    this.isGPSLocating = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.geocodingService.reverseGeocode(pos.coords.latitude, pos.coords.longitude).subscribe(result => {
          this.ngZone.run(() => {
            this.isGPSLocating = false;
            if (result) {
              this.geocodedLat = result.lat;
              this.geocodedLng = result.lng;
              this.geocodedDisplayName = result.displayName;
              this.registerForm.patchValue({ localidad: result.displayName }, { emitEvent: false });
            }
          });
        });
      },
      () => { this.ngZone.run(() => { this.isGPSLocating = false; }); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async register() {
    this.user.surname = this.registerForm.controls['surname'].value;
    this.user.realname = this.registerForm.controls['realname'].value;
    this.user.username = this.registerForm.controls['username'].value;
    this.user.email = this.registerForm.controls['email'].value;
    this.user.password = await this.encryptionService.encrypt(this.registerForm.controls['password'].value);
    this.user.recaptchaToken = this.captchaToken;
    const rawDate: Date = this.registerForm.controls['birth_date'].value;
    const birth_date = rawDate
      ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(rawDate.getDate()).padStart(2, '0')}`
      : undefined;
    this.user.email = this.registerForm.controls['email'].value;
    this.user.localidad = this.registerForm.controls['localidad'].value || undefined;
    this.user.lat = this.geocodedLat ?? undefined;
    this.user.lng = this.geocodedLng ?? undefined;

    if (this.accountType === 'tatuador') {
      this.user.estudio = this.registerForm.controls['estudio'].value || undefined;
      this.user.especialidadIds = this.especialidadesSeleccionadas.map(e => e.id);
      this.registerService.registerTatuador({ ...this.user, birth_date }).subscribe(
        () => {
          this.showSuccessDialogTatuador();
          setTimeout(() => {
            this.router.navigate(['/login']);
            this.dialog.closeAll();
          }, 3000);
        },
        (error) => {
          this.showErrorDialog(error.error?.message || 'Error desconocido');
        }
      );
    } else {
      this.registerService.register({ ...this.user, birth_date }).subscribe(
        () => {
          this.showSuccessDialog();
          setTimeout(() => {
            this.router.navigate(['/login']);
            this.dialog.closeAll();
          }, 2500);
        },
        (error) => {
          console.error('Error al registrar: ', error);
          this.showErrorDialog(error.error?.message || 'Error desconocido');
        }
      );
    }
  }

  private showErrorDialog(errorMessage: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage, type: 'error' },
    });
  }

  private showSuccessDialog(): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: 'Registro exitoso', type: 'success' },
    });
  }

  private showSuccessDialogTatuador(): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: 'Solicitud enviada. Tu cuenta está pendiente de aprobación.', type: 'success' },
    });
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent as FormGroup;
      if (!parent) return null;
      const password = parent.get('password')?.value;
      if (control.value && password !== control.value) {
        return { passwordsMismatch: true };
      }
      return null;
    };
  }

  get passwordStrength(): number {
    const v: string = this.registerForm.get('password')?.value || '';
    let score = 0;
    if (v.length >= 8) score++;
    if (/[a-z]/.test(v)) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    return score;
  }

  get password2() {
    return this.registerForm.get('password2');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get passwordHasUpperCaseCheck(): boolean {
    const v = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(v);
  }
  get passwordHasLowerCaseCheck(): boolean {
    const v = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(v);
  }
  get passwordHasNumberCheck(): boolean {
    const v = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(v);
  }

  onConfirmBlur() {
    this.password2?.markAsTouched();
    this.password2?.updateValueAndValidity({ onlySelf: true, emitEvent: true });
  }

  passwordHasNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      const hasNumber = /\d/.test(password);
      if (password && !hasNumber) {
        return { noNumber: 'La contraseña debe contener al menos un número.' };
      }
      return null;
    };
  }

  passwordHasUpperCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (password && !/[A-Z]/.test(password)) {
        return { noUpperCase: true };
      }
      return null;
    };
  }

  passwordHasLowerCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (password && !/[a-z]/.test(password)) {
        return { noLowerCase: true };
      }
      return null;
    };
  }

  onCaptchaResolved(token: string | null) {
    this.captchaToken = token;
    this.captchaValid = !!token;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  usernameAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) return of(null);
      return timer(500).pipe(
        switchMap(() => this.registerService.checkAvailability('username', control.value)),
        map(res => res.available ? null : { usernameTaken: true }),
        catchError(() => of(null))
      );
    };
  }

  emailAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return timer(500).pipe(
        switchMap(() => this.registerService.checkAvailability('email', control.value)),
        map(res => res.available ? null : { emailTaken: true }),
        catchError(() => of(null))
      );
    };
  }

  onDateInput(event: any) {
    let value: string = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    event.target.value = value;
  }
}
