import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';
import { MatDialog } from '@angular/material/dialog';
import { EncryptionService } from 'src/app/services/auth/encryption.service';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';
import { ForgotPasswordService } from 'src/app/services/auth/forgotpass.service';
import { MatFormField, MatError } from '@angular/material/form-field';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
    selector: 'app-forgot-pass',
    templateUrl: './forgotPass.component.html',
    styleUrls: ['./forgotPass.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatInput, NgIf, MatError, MatButton, MatIcon, RouterLink, RecaptchaModule, NoDoubleSubmitDirective]
})
export class ForgotPassComponent implements OnInit {
  forgotPassForm: FormGroup;
  email: string = '';
  captchaValid = false;
  captchaToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private dialog: MatDialog,
    private encryptionService: EncryptionService,
    private ForgotPasswordService: ForgotPasswordService
  ) {
    this.forgotPassForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void { }

  get emailControl() {
    return this.forgotPassForm.get('email');
  }

  onCaptchaResolved(token: string | null) {
    this.captchaToken = token;
    this.captchaValid = !!token;
  }

  forgotPass() {
    if (this.forgotPassForm.valid && this.captchaToken) {
      this.email = this.forgotPassForm.value.email;
      this.ForgotPasswordService.forgotPassword(this.email).subscribe({
        next: () => {
          this.dialog.open(ErrorDialogComponent, {
            data: {
              type: 'success',
              message: 'Se ha enviado un correo para recuperar la contraseña.'
            }
          });
          this.router.navigateByUrl('/login');
        },
        error: () => {
          this.dialog.open(ErrorDialogComponent, {
            data: {
              type: 'error',
              message: 'Error al enviar la solicitud de recuperación de contraseña.'
            }
          });
        }
      });
    }
  }
}