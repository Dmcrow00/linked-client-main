import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { encryptRsaOaep } from '@dmcrow00/ng-core/auth';
import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Cifra las contraseñas con la clave pública del backend antes de mandarlas (RSA-OAEP, SHA-256). */
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private http = inject(HttpClient);

  async encrypt(text: string): Promise<string> {
    const respuesta = await firstValueFrom(
      this.http.get<ApiResponse<{ publicKey: string }>>(`${environment.urlApi}auth/public-key`)
    );
    return encryptRsaOaep(unwrap(respuesta).publicKey, text);
  }
}
