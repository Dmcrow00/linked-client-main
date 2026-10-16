import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RolApl } from 'src/app/models/rol.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private endpoint = `${environment.urlApi}users`;
  endpointRoles = `${environment.urlApi}`;

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
      .get<ApiResponse<User>>(`${this.endpoint}/${id}`)
      .pipe(map(unwrap));
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.endpoint}`).pipe(map(unwrap));
  }

  updateUser(id: number, userRequest: Partial<User>): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.endpoint}/${id}`, userRequest)
      .pipe(map(unwrap));
  }

  updateUserRoles(userId: number, roleIds: number[]): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(`${this.endpoint}/${userId}/roles`, { roleIds })
      .pipe(map(unwrap));
  }

  updateProfilePhoto(id: number, image: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', image);

    return this.http
      .patch<ApiResponse<User>>(`${this.endpoint}/${id}/profile-photo`, formData)
      .pipe(map(unwrap));
  }


  getAllUserRoles(idUser: number): Observable<number[]> {
    return this.http.get<ApiResponse<number[]>>(`${this.endpoint}/getUserRolsByIdUser/${idUser}`).pipe(map(unwrap));
  }

  getRoles(): Observable<RolApl[]> {
    return this.http.get<ApiResponse<RolApl[]>>(`${this.endpoint}/getAllRoles`).pipe(map(unwrap));
  }

  getUserRolByidRole(idRole: string): Observable<RolApl> {
    return this.http.get<ApiResponse<RolApl>>(`${this.endpoint}/getUserRolByidRole/${idRole}`).pipe(map(unwrap));
  }

}
