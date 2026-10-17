import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ConfirmRequest } from '@dmcrow00/ng-core/ui';

/** La pregunta de `ConfirmService` con el diseño de los diálogos de la app. Cierra con true si se confirma. */
@Component({
  selector: 'app-confirmacion-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatButton, MatIcon, MatDialogClose],
  template: `
    <mat-card class="crud-delete-dialog">
      <mat-card-header>
        <mat-card-title>
          @if (pregunta.danger) {
            <mat-icon color="warn" class="icon">warning</mat-icon>
          }
          {{ pregunta.title }}
        </mat-card-title>
      </mat-card-header>
      <mat-card-content class="content">
        <p class="confirmation-text">{{ pregunta.message }}</p>
      </mat-card-content>
      <mat-card-actions align="end" class="actions">
        <button mat-stroked-button type="button" [mat-dialog-close]="false">{{ pregunta.cancelText ?? 'Cancelar' }}</button>
        <button mat-flat-button type="button" [color]="pregunta.danger ? 'warn' : 'primary'" [mat-dialog-close]="true">
          {{ pregunta.confirmText ?? 'Confirmar' }}
        </button>
      </mat-card-actions>
    </mat-card>
  `,
})
export class ConfirmacionDialogComponent {
  protected readonly pregunta = inject<ConfirmRequest>(MAT_DIALOG_DATA);
}
