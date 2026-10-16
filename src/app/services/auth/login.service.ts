import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { Injectable, inject } from '@angular/core';
import { LoginRequest } from '../../models/loginRequest';
import { HttpClient } from '@angular/common/http';
import { tap, Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthState } from '@dmcrow00/ng-core/auth';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService implements AuthState {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private currentUserLoginOnSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  private currentUserDataSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');
  private currentUserRolSubject: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  constructor() {
    const token = sessionStorage.getItem('accessToken');
    this.currentUserLoginOnSubject.next(!!token);
    this.currentUserDataSubject.next(token || '');

    if (token) {
      this.updateUserId(token);
    }
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.http
      .post<ApiResponse<{ token: string }>>(`${environment.urlHost}auth/login`, credentials)
      .pipe(map(unwrap),
        tap((response) => {
          const token = response.token;
          sessionStorage.setItem('accessToken', token);
          this.currentUserDataSubject.next(token);
          this.currentUserLoginOnSubject.next(true);
          this.updateUserId(token);
        }),
        map((response) => response.token)
      );
  }

  logout(): void {
    sessionStorage.removeItem('accessToken');
    this.currentUserLoginOnSubject.next(false);
    this.currentUserDataSubject.next('');
    this.userService.setUserId(null);
  }

  private updateUserId(token: string | null) {
    if (token) {
      interface DecodedToken { id: number; rol?: string; [key: string]: unknown; }
      const decodedToken = jwtDecode<DecodedToken>(token);
      const userId = decodedToken?.id;

      if (typeof userId === 'number' && userId > 0) {
        this.userService.setUserId(userId);
      } else {
        this.userService.setUserId(null);
      }
      this.currentUserRolSubject.next(decodedToken.rol || '');
    }
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }

  /** Para los guards de ng-core (`AuthState`). */
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  get userData(): Observable<string> {
    return this.currentUserDataSubject.asObservable();
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOnSubject.asObservable();
  }

  get userRol(): Observable<string> {
    return this.currentUserRolSubject.asObservable();
  }

  get userToken(): string {
    return this.currentUserDataSubject.value;
  }

  get currentUserId(): number | null {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return null;
    
    try {
      interface DecodedToken { id: number; [key: string]: unknown; }
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.id ?? null;
    } catch {
      return null;
    }
  }
}
