import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';
import { LoginRequest } from '../../models/loginRequest';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';
import { SupportTicketCreateComponent } from 'src/app/aplicacion/support-ticket/support-ticket-create/support-ticket-create.component';
import { MatDialog } from '@angular/material/dialog';
import { EncryptionService } from 'src/app/services/auth/encryption.service';
import { ProximamenteService } from 'src/app/services/proximamente.service';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatIcon, MatFormField, MatInput, NgIf, MatError, MatIconButton, MatSuffix, RouterLink, RecaptchaModule, MatButton, NoDoubleSubmitDirective]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string = '';
  hide = true;
  captchaValid = false;
  captchaToken: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private loginService: LoginService,
    private proximamenteService: ProximamenteService,
    private encryptionService: EncryptionService,
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]], //Validadores requeridos
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { }

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
        next: (userData) => { },
        error: (errorData) => {
          this.showErrorDialog(errorData);
          this.loginError = errorData;
        },
        complete: () => {
          this.router.navigateByUrl('/inicio');
          this.loginForm.reset();
          this.captchaToken = null; 
          this.captchaValid = false;
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.showErrorDialog('Error al ingresar los datos.');
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

  private showErrorDialog(errorMessage: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage, type: 'error' },
    });
  }

  onCaptchaResolved(token: string | null) {
  this.captchaToken = token;
  this.captchaValid = !!token; // true si el token existe
  }
}
