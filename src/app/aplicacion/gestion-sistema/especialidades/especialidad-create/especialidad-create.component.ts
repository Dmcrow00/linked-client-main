import { Component } from '@angular/core';
import { Especialidad } from '../especialidades.model';
import { EspecialidadesService } from '../especialidades.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatIconButton, MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-especialidad-create',
    templateUrl: './especialidad-create.component.html',
    styleUrl: './especialidad-create.component.scss',
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, FormsModule, MatFormField, MatLabel, MatInput, NgIf, MatIconButton, MatSuffix, MatIcon, MatError, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class EspecialidadCreateComponent {
especialidad: Especialidad = new Especialidad();

  constructor(
    private especialidadService: EspecialidadesService,
    private dialogRef: MatDialogRef<EspecialidadCreateComponent>
  ) { }

  createEspecialidad(): void {
    this.especialidadService.createEspecialidad({
      nombre: this.especialidad.nombre,
      descripcion: this.especialidad.descripcion,
    }).subscribe({
      next: () => {
        this.dialogRef.close(true); // Cierra el diálogo y indica que se guardaron los cambios
      },
      error: (error) => {
        console.error('Error creando especialidad', error);
      },
    });
  }
  cancel(): void {
    this.dialogRef.close(false); // Cierra el diálogo sin guardar cambios
  }
}
