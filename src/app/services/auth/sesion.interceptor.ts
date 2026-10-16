import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AvisosService } from 'src/app/core/avisos.service';
import { environment } from 'src/environments/environment';
import { LoginService } from './login.service';

/**
 * Manda el token sólo al backend propio (nunca a servicios externos como Nominatim) y, si el backend responde 401
 * con una sesión abierta, la cierra y lleva al login. Un 403 no cierra la sesión: es una acción no permitida y la
 * pantalla muestra el motivo.
 */
export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const dialog = inject(MatDialog);
  const avisos = inject(AvisosService);

  const token = loginService.userToken;
  const esDelBackend = req.url.startsWith(environment.urlApi) || req.url.startsWith(environment.urlHost);
  const pedido = token && esDelBackend ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(pedido).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token && esDelBackend) {
        dialog.closeAll();
        loginService.logout();
        avisos.info('Tu sesión venció. Volvé a ingresar.');
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    })
  );
};
