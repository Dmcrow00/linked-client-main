import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  constructor(private http: HttpClient) {}

  async encrypt(text: string): Promise<string> {
    const key = await this.fetchPublicKey();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      key,
      new TextEncoder().encode(text)
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  private async fetchPublicKey(): Promise<CryptoKey> {
    const { publicKey } = await firstValueFrom(
      this.http.get<{ publicKey: string }>(`${environment.urlApi}auth/public-key`)
    );

    const pem = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '');
    const binaryDer = Uint8Array.from(atob(pem), c => c.charCodeAt(0));

    return window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
  }
}
