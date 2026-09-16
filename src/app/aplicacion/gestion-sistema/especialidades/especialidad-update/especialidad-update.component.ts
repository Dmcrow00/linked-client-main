import { Component, Inject } from '@angular/core';
import { EspecialidadesService } from '../especialidades.service';
import { Especialidad } from '../especialidades.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component.js';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-especialidad-update',
    templateUrl: './especialidad-update.component.html',
    styleUrl: './especialidad-update.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, FormsModule, MatFormField, MatLabel, MatInput, NgIf, MatIconButton, MatSuffix, MatIcon, MatError, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class EspecialidadUpdateComponent {
especialidad: Especialidad;

  constructor(
    private especialidadesService: EspecialidadesService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<EspecialidadUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { especialidad: Especialidad
     }
  ) {
    // Inicializo la especialidad con data del dialog
    this.especialidad = { ...data.especialidad };
  }

  onUpdateEspecialidad() {
    this.especialidadesService
      .updateEspecialidad(this.especialidad.id, {
        nombre: this.especialidad.nombre,
        descripcion: this.especialidad.descripcion,
      })
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Ocurrió un error';
          this.showErrorDialog(errorMessage);
        },
      });
  }

  private showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { title: 'Error', message, type: 'error' },
      width: '400px',
    });
  }

  cancel(): void {
    this.dialogRef.close(false); // Cierra el diálogo sin guardar cambios
  }
}
