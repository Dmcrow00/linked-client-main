import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private http = inject(HttpClient);

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${environment.urlHost}users/reset-password`, { token, newPassword })
      .pipe(map(unwrap));
  }
}