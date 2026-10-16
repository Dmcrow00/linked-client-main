import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DynamicFormComponent, FieldConfig, buildForm, useSaveForm } from '@dmcrow00/ng-core/forms';
import { DialogoCrudComponent } from 'src/app/core/ui/dialogo-crud/dialogo-crud.component';
import { Especialidad, EspecialidadPayload } from '../especialidades.model';
import { EspecialidadesService } from '../especialidades.service';

export interface EspecialidadDialogData {
  /** Sin especialidad es un alta. */
  especialidad?: Especialidad;
  /** Detalle: los mismos campos, sin poder editarlos. */
  soloLectura?: boolean;
}

const CAMPOS: FieldConfig<EspecialidadPayload>[] = [
  { key: 'nombre', type: 'text', label: 'Nombre', required: true, maxLength: 100 },
  { key: 'descripcion', type: 'textarea', label: 'Descripción', required: true, rows: 4 },
];

/** Alta, edición y detalle de una especialidad. Cierra con true si guardó. */
@Component({
  selector: 'app-especialidad-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogoCrudComponent, DynamicFormComponent],
  template: `
    <app-dialogo-crud [titulo]="titulo" [soloLectura]="soloLectura" [guardando]="estado.saving()" [error]="estado.error()"
                      [textoGuardar]="estado.mode() === 'create' ? 'Crear' : 'Guardar'" (guardar)="guardar()" (cerrar)="cerrar()">
      <dmc-dynamic-form [fields]="campos" [form]="form" [readonly]="soloLectura" [submitted]="estado.submitted()"
                        idPrefix="especialidad" (send)="guardar()" />
      @if (soloLectura && data.especialidad; as e) {
        <p class="especialidad-estado">Estado: {{ e.status === 'true' ? 'Activo' : 'Inactivo' }}</p>
      }
    </app-dialogo-crud>
  `,
})
export class EspecialidadDialogComponent {
  private service = inject(EspecialidadesService);
  private dialogRef = inject<MatDialogRef<EspecialidadDialogComponent, boolean>>(MatDialogRef);
  protected readonly data = inject<EspecialidadDialogData>(MAT_DIALOG_DATA);

  protected readonly campos = CAMPOS;
  protected readonly form = buildForm<EspecialidadPayload>(CAMPOS, this.data.especialidad);
  protected readonly soloLectura = !!this.data.soloLectura;
  protected readonly estado = useSaveForm({
    entity: () => this.data.especialidad,
    errorMessage: 'No se pudo guardar la especialidad.',
  });
  protected readonly titulo = this.soloLectura
    ? 'Especialidad'
    : this.estado.mode() === 'create' ? 'Cargar especialidad' : 'Editar especialidad';

  async guardar(): Promise<void> {
    if (this.soloLectura || !this.estado.validate(this.form)) return;
    const datos = this.form.getRawValue();
    const especialidad = this.data.especialidad;
    await this.estado.save(
      () => especialidad
        ? this.service.updateEspecialidad(especialidad.id, datos)
        : this.service.createEspecialidad(datos),
      () => this.dialogRef.close(true)
    );
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
