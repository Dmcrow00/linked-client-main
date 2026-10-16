import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  private http = inject(HttpClient);

  forgotPassword(email: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${environment.urlHost}users/forgot-password`, { email })
      .pipe(map(unwrap));
  }
}
