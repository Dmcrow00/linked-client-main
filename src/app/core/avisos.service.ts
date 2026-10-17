import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apiErrorMessage } from '@dmcrow00/ng-core/http';
import { Notifier } from '@dmcrow00/ng-core/ui';

/**
 * Los avisos de la app (snackbar de Material). Es el único lugar que muestra errores: cada pantalla llama a
 * `fallo` con el error del pedido; la sesión vencida la avisa `sesionInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class AvisosService extends Notifier {
  private snackBar = inject(MatSnackBar);

  success(mensaje: string): void {
    this.snackBar.open(mensaje, 'OK', { duration: 3000 });
  }

  error(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000 });
  }

  info(mensaje: string): void {
    this.snackBar.open(mensaje, 'OK', { duration: 4000 });
  }

  /** Un pedido al servidor falló: muestra el mensaje del servidor o, si no mandó uno, `mensaje`. */
  fallo(err: unknown, mensaje: string): void {
    // 401: el interceptor ya cerró la sesión y avisó.
    if (err instanceof HttpErrorResponse && err.status === 401) return;
    this.error(apiErrorMessage(err, mensaje));
  }
}
