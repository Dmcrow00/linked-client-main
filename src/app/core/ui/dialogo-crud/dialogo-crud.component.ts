import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

/**
 * El marco de los diálogos de alta, edición y detalle: título, contenido (el formulario, proyectado), el error al
 * guardar y los botones. En modo `soloLectura` queda sólo "Cerrar".
 *
 * ```html
 * <app-dialogo-crud [titulo]="titulo" [guardando]="estado.saving()" [error]="estado.error()"
 *                   (guardar)="guardar()" (cerrar)="cerrar()">
 *   <dmc-dynamic-form [fields]="campos" [form]="form" [submitted]="estado.submitted()" (send)="guardar()" />
 * </app-dialogo-crud>
 * ```
 */
@Component({
  selector: 'app-dialogo-crud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatButton],
  template: `
    <mat-card class="dialog-card">
      <mat-card-header>
        <mat-card-title>{{ titulo() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <ng-content />
        @if (error(); as e) {
          <p class="dialogo-crud__error" role="alert">{{ e }}</p>
        }
      </mat-card-content>
      <mat-card-actions class="action-buttons">
        @if (soloLectura()) {
          <button mat-stroked-button type="button" (click)="cerrar.emit()">Cerrar</button>
        } @else {
          <button mat-stroked-button type="button" [disabled]="guardando()" (click)="cerrar.emit()">Cancelar</button>
          <button mat-flat-button type="button" class="create-button" [disabled]="guardando()" (click)="guardar.emit()">
            {{ guardando() ? 'Guardando…' : textoGuardar() }}
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .dialogo-crud__error {
      color: var(--mat-sys-error, #d32f2f);
      margin: 0.5rem 0 0;
    }
  `,
})
export class DialogoCrudComponent {
  readonly titulo = input.required<string>();
  readonly guardando = input(false);
  readonly error = input<string | null>(null);
  readonly soloLectura = input(false);
  readonly textoGuardar = input('Guardar');
  readonly guardar = output<void>();
  readonly cerrar = output<void>();
}
