import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { TatuadorService } from 'src/app/services/user/tatuador.service';
import { AvisosService } from 'src/app/core/avisos.service';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatChip, MatChipSet } from '@angular/material/chips';

/**
 * Datos profesionales del tatuador en "Mi perfil". Las especialidades se muestran pero no se editan: el backend
 * sólo deja asignarlas a un administrador.
 */
@Component({
    selector: 'app-tatuador',
    templateUrl: './tatuador.component.html',
    styleUrls: ['./tatuador.component.scss'],
    imports: [MatDivider, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatHint, MatChipSet, MatChip]
})
export class TatuadorComponent implements OnInit, OnChanges {
  private tatuadorService = inject(TatuadorService);
  private avisos = inject(AvisosService);
  private fb = inject(FormBuilder);

  @Input() userId!: number|undefined;
  @Input() initialEstudio: string | null | undefined = null;
  @Input() initialFechaInicio: string | Date | null | undefined = null;

  tatuadorForm: FormGroup = this.fb.group({
    estudio: [''],
    fechaInicioActividad: [null]
  });
  today: Date = new Date();
  especialidades: Especialidad[] = [];

  ngOnInit(): void {
    this.loadEspecialidades();
    this.patchFormIfNeeded();
  }

  // Detecta si los valores iniciales cambian después de ngOnInit
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialEstudio'] || changes['initialFechaInicio']) {
      this.patchFormIfNeeded();
    }
  }

  private patchFormIfNeeded(): void {
    this.tatuadorForm.patchValue({
      estudio: this.initialEstudio ?? '',
      fechaInicioActividad: this.initialFechaInicio ? new Date(this.initialFechaInicio) : null
    });
  }

  private loadEspecialidades(): void {
    if (!this.userId) return;
    this.tatuadorService.getEspecialidadesTatuador(this.userId).subscribe({
      next: res => (this.especialidades = res),
      error: err => this.avisos.fallo(err, 'No se pudieron cargar tus especialidades.'),
    });
  }

  /** Para que el componente padre obtenga los datos al guardar. */
  public getTatuadorData(): { estudio?: string | null, fechaInicioActividad?: Date | null } {
    return this.tatuadorForm.value;
  }
}
