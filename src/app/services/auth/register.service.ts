import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { User } from 'src/app/auth/auth.models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private http = inject(HttpClient);


  register(user: Omit<User, 'birth_date'> & { birth_date?: string }): Observable<{ token: string }> {
    return this.http.post<ApiResponse<{ token: string }>>(`${environment.urlHost}users/register`, user).pipe(map(unwrap));
  }

  registerTatuador(user: Omit<User, 'birth_date'> & { birth_date?: string }): Observable<{ token: string }> {
    return this.http.post<ApiResponse<{ token: string }>>(`${environment.urlHost}users/register-tatuador`, user).pipe(map(unwrap));
  }

  checkAvailability(field: 'username' | 'email', value: string): Observable<{ available: boolean }> {
    return this.http.get<ApiResponse<{ available: boolean }>>(
      `${environment.urlHost}auth/check-availability`,
      { params: { field, value } }
    ).pipe(map(unwrap));
  }
}
