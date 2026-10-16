import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EspecialidadesService } from '../especialidades.service';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
@Component({
    selector: 'app-especialidad-delete',
    templateUrl: './especialidad-delete.component.html',
    styleUrl: './especialidad-delete.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatIcon, MatCardContent, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class EspecialidadDeleteComponent {
  private especialidadService = inject(EspecialidadesService);
  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<EspecialidadDeleteComponent>>(MatDialogRef);
  data = inject<{
    id: number;
}>(MAT_DIALOG_DATA);

  especialidadName: string = '';
  successMessage: string | null = null;

  ngOnInit(): void {
    this.especialidadService.getEspecialidad(this.data.id).subscribe({
      next: (especialidad) => {
        this.especialidadName = especialidad.nombre;
      },
      error: () => {
      },
    });
  }

  deleteEspecialidad(): void {
    this.especialidadService.deleteEspecialidad(this.data.id).subscribe({
      next: () => {
        this.successMessage = 'Especialidad eliminada satisfactoriamente';
        this.dialogRef.close(true);
      },
      error: (error) => {
        const errorMessage = error?.error?.msg || 'Ocurrió un error';
        this.showErrorDialog(errorMessage);
      },
    });
  }

  private showErrorDialog(errorMessage: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage, type: 'error' },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
