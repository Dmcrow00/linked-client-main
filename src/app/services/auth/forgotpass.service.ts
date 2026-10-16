import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { User } from 'src/app/auth/auth.models';
import { environment } from 'src/environments/environment';
import { ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandler);


  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.urlHost}users/forgot-password`, { email })
      .pipe(
        tap(() => {
        }),
        catchError((error: HttpErrorResponse) => {
          this.errorHandler.handleError(error);
          throw error;
        })
      );
  }
}
