import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';
import { LoginRequest } from '../../models/loginRequest';
import { AvisosService } from 'src/app/core/avisos.service';
import { SupportTicketCreateComponent } from 'src/app/aplicacion/support-ticket/support-ticket-create/support-ticket-create.component';
import { MatDialog } from '@angular/material/dialog';
import { EncryptionService } from 'src/app/services/auth/encryption.service';
import { ProximamenteService } from 'src/app/services/proximamente.service';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { MatIconButton, MatButton } from '@angular/material/button';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatIcon, MatFormField, MatInput, MatError, MatIconButton, MatSuffix, RouterLink, RecaptchaModule, MatButton, NoDoubleSubmitDirective]
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private avisos = inject(AvisosService);
  private dialog = inject(MatDialog);
  private loginService = inject(LoginService);
  private proximamenteService = inject(ProximamenteService);
  private encryptionService = inject(EncryptionService);

  loginForm: FormGroup;
  hide = true;
  captchaValid = false;
  captchaToken: string | null = null;

  constructor() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]], //Validadores requeridos
      password: ['', [Validators.required]],
    });
  }


  get username() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  async login() {
    if (this.loginForm.valid && this.captchaToken) {
      const loginRequest: LoginRequest = {
        username: this.username?.value,
        password: await this.encryptionService.encrypt(this.passwordControl?.value),
        recaptchaToken: this.captchaToken
      };

      this.loginService.login(loginRequest).subscribe({
        next: () => {
          this.loginForm.reset();
          this.captchaToken = null;
          this.captchaValid = false;
          void this.router.navigateByUrl(this.destino());
        },
        error: (err) => this.avisos.fallo(err, 'No se pudo iniciar sesión.'),
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.avisos.error('Completá el usuario, la contraseña y el captcha.');
    }
  }

  showProximamente(): void {
    this.proximamenteService.mostrarMensaje();
  }

  openSupportTicket(): void {
    this.dialog.open(SupportTicketCreateComponent, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
    });
  }

  /** A dónde volver: la pantalla que pidió el login (sesión vencida o ruta protegida) o el inicio. */
  private destino(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // Sólo rutas internas: un returnUrl de otro sitio no se sigue.
    return returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/inicio';
  }

  onCaptchaResolved(token: string | null) {
  this.captchaToken = token;
  this.captchaValid = !!token; // true si el token existe
  }
}
