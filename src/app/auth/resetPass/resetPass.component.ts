import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/auth/login.service';
import { AvisosService } from 'src/app/core/avisos.service';
import { EncryptionService } from 'src/app/services/auth/encryption.service';
import { ResetPasswordService } from 'src/app/services/auth/resetpass.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';


@Component({
    selector: 'app-reset-pass',
    templateUrl: './resetPass.component.html',
    styleUrls: ['./resetPass.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatFormField, MatLabel, MatInput, MatError, MatIconButton, MatSuffix, MatIcon, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class ResetPassComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loginService = inject(LoginService);
  private avisos = inject(AvisosService);
  private encryptionService = inject(EncryptionService);
  private resetPasswordService = inject(ResetPasswordService);

  ResetPassForm: FormGroup;
  password = '';
  token = '';
  hide = true; 

  constructor() {
    this.ResetPassForm = this.fb.group({
      token: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get tokenControl() {
    return this.ResetPassForm.get('token');
  }

  get newPasswordControl() {
    return this.ResetPassForm.get('newPassword');
  }


  async resetPass(){
    this.token = this.tokenControl?.value;
    this.password = await this.encryptionService.encrypt(this.newPasswordControl?.value);

    if (this.ResetPassForm.valid) {
      this.resetPasswordService.resetPassword(this.token, this.password).subscribe({
        next: () => {
          this.avisos.success('Contraseña actualizada correctamente. Puedes iniciar sesión con tu nueva contraseña.');
          this.router.navigateByUrl('/login');
        },
        error: (err) => this.avisos.fallo(err, 'Error al actualizar la contraseña. Por favor, verifica el token y vuelve a intentarlo.')
      });
    }
  }
}
