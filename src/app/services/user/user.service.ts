import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RolApl } from 'src/app/models/rol.models.js';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private endpoint = `${environment.urlApi}users`;
  endpointRoles = `${environment.urlApi}`;
  constructor(private http: HttpClient) {
  }

  private userId: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  setUserId(id: number | null): void {
    this.userId.next(id);
  }

  getUserId(): Observable<number | null> {
    return this.userId.asObservable();
  }

  // Metodo para obtener el username del usuario logueado
  getLoggedInUsername(): Observable<string | null> {
    return this.getUserId().pipe(
      switchMap((userId) => {
        if (userId != null) {
          return this.getUser(userId).pipe(map(user => user.username));
        }
        return of(null);
      })
    );
  }

  getUser(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.endpoint}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.endpoint}`);
  }

  updateUser(id: number, userRequest: any): Observable<User> {
    return this.http
      .put<User>(`${this.endpoint}/${id}`, userRequest)
      .pipe(catchError(this.handleError));
  }

  updateUserRoles(userId: number, roleIds: number[]): Observable<void> {
    return this.http
      .put<void>(`${this.endpoint}/${userId}/roles`, { roleIds })
      .pipe(catchError(this.handleError));
  }

  updateProfilePhoto(id: number, image: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', image);

    return this.http
      .patch<User>(`${this.endpoint}/${id}/profile-photo`, formData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('Se ha producido un error ', error.error);
    } else {
      console.error(
        'Backend retorno el codigo de estado ',
        error.status,
        error.error
      );
    }
    return throwError(
      () => new Error('Algo fallo. Por favor intente nuevamente.')
    );
  }

  getAllUserRoles(idUser: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.endpoint}/getUserRolsByIdUser/${idUser}`);
  }

  getRoles(): Observable<RolApl[]> {
    return this.http.get<RolApl[]>(`${this.endpoint}/getAllRoles`);
  }

  getUserRolByidRole(idRole: string): Observable<RolApl> {
    return this.http.get<RolApl>(`${this.endpoint}/getUserRolByidRole/${idRole}`);
  }

}
