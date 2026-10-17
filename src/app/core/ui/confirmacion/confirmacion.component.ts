import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmService } from '@dmcrow00/ng-core/ui';
import { ConfirmacionDialogComponent } from './confirmacion-dialog.component';

/**
 * Muestra las preguntas de `ConfirmService` en un diálogo de Material. Va una sola vez, en `app.component.html`;
 * las pantallas sólo hacen `if (await confirm.ask({...}))`.
 */
@Component({
  selector: 'app-confirmacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class ConfirmacionComponent {
  private confirm = inject(ConfirmService);
  private dialog = inject(MatDialog);
  private abierto: MatDialogRef<ConfirmacionDialogComponent, boolean> | null = null;

  constructor() {
    effect(() => {
      const pregunta = this.confirm.pending();
      untracked(() => {
        // Una pregunta nueva reemplaza a la abierta (ConfirmService ya le respondió "no").
        const anterior = this.abierto;
        this.abierto = null;
        anterior?.close();
        if (!pregunta) return;

        const ref = this.dialog.open<ConfirmacionDialogComponent, unknown, boolean>(ConfirmacionDialogComponent, {
          data: pregunta,
          width: '400px',
          disableClose: true,
        });
        this.abierto = ref;
        ref.afterClosed().subscribe((respuesta) => {
          if (this.abierto !== ref) return;
          this.abierto = null;
          this.confirm.answer(respuesta === true);
        });
      });
    });
  }
}
