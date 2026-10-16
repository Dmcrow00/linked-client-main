import { Injectable, inject } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private snackBar = inject(MatSnackBar);


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = 'Error desconocido.';

        if (error.error instanceof ErrorEvent) {
          // Error del cliente o de red
          errorMsg = `Error de red: ${error.error.message}`;
        } else {
          switch (error.status) {
            case 0:
              errorMsg = '⚠️ No se pudo conectar con el servidor. Verifique su conexión.';
              break;
            case 400:
              errorMsg = 'Solicitud incorrecta. Revise los datos enviados.';
              break;
            case 401:
              errorMsg = 'No autorizado. Por favor, inicie sesión.';
              break;
            case 403:
              errorMsg = 'Acceso denegado. No tiene permisos.';
              break;
            case 404:
              errorMsg = 'Recurso no encontrado.';
              break;
            case 500:
              errorMsg = 'Error interno del servidor. Intente más tarde.';
              break;
            default:
              errorMsg = `Error ${error.status}: ${error.message}`;
              break;
          }
        }

        // Mostrar mensaje en snackbar
        this.snackBar.open(errorMsg, 'Cerrar', { duration: 6000 });

        return throwError(() => error);
      })
    );
  }
}
