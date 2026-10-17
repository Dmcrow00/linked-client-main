import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgendaService } from '../agenda.service';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { HorarioHabitual, HorarioHabitualInput } from 'src/app/models/horarios-tatuador/horario-habitual';
import { CdkScrollable } from '@angular/cdk/scrolling';

import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AvisosService } from 'src/app/core/avisos.service';

@Component({
    selector: 'app-gestionar-horario',
    templateUrl: './gestionar-horario.component.html',
    styleUrl: './gestionar-horario.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatProgressSpinner, MatIcon, MatButton, FormsModule, ReactiveFormsModule, MatSlideToggle, MatFormField, MatLabel, MatInput, MatError, MatDialogActions, NoDoubleSubmitDirective]
})
export class GestionarHorarioComponent implements OnInit {
private fb = inject(FormBuilder);
private agendaService = inject(AgendaService);
private avisos = inject(AvisosService);
dialogRef = inject<MatDialogRef<GestionarHorarioComponent>>(MatDialogRef);

horarioForm: FormGroup;
  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  isLoading = false;
  errorCarga: string | null = null;
  isSaving = false;

  constructor() {
    // Inicializamos el formulario con un FormArray vacío
    this.horarioForm = this.fb.group({
      dias: this.fb.array([])
    });
    this.buildDiasFormArray(); // Creamos la estructura para los 7 días
  }

  ngOnInit(): void {
    this.loadHorario();
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra el diálogo sin devolver nada
  }

  // Helper para acceder fácilmente al FormArray en el template
  get diasFormArray(): FormArray {
    return this.horarioForm.get('dias') as FormArray;
  }

  // Crea la estructura del FormArray con 7 FormGroups (uno por día)
  private buildDiasFormArray(): void {
    for (let i = 0; i < 7; i++) {
      this.diasFormArray.push(this.fb.group({
        diaSemana: [i], // Guardamos el número del día (0-6)
        enabled: [false], // Checkbox/Toggle para habilitar el día
        // Validadores: requeridos SOLO si 'enabled' es true
        horaInicio: ['', Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')], // Formato HH:MM
        horaFin: ['', Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')],
        duracionTurnoMin: [60, Validators.min(1)] // Default 60 mins, mínimo 1
      }));

      // Suscripción para añadir/quitar validadores dinámicamente
      const dayGroup = this.diasFormArray.at(i);
      dayGroup.get('enabled')?.valueChanges.subscribe(enabled => {
        const horaInicioCtrl = dayGroup.get('horaInicio');
        const horaFinCtrl = dayGroup.get('horaFin');
        const duracionCtrl = dayGroup.get('duracionTurnoMin');

        if (enabled) {
          horaInicioCtrl?.setValidators([Validators.required, Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')]);
          horaFinCtrl?.setValidators([Validators.required, Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')]);
          duracionCtrl?.setValidators([Validators.required, Validators.min(1)]);
        } else {
          horaInicioCtrl?.clearValidators();
          horaFinCtrl?.clearValidators();
          duracionCtrl?.clearValidators();
          // Opcional: Limpiar valores cuando se deshabilita
          // horaInicioCtrl?.setValue('');
          // horaFinCtrl?.setValue('');
          // duracionCtrl?.setValue(60);
        }
        horaInicioCtrl?.updateValueAndValidity();
        horaFinCtrl?.updateValueAndValidity();
        duracionCtrl?.updateValueAndValidity();
      });
    }
  }

  // Carga el horario actual desde el backend
  loadHorario(): void {
    this.isLoading = true;
    this.errorCarga = null;
    this.agendaService.getHorarioHabitual().subscribe({
      next: (horariosActuales) => {
        this.patchForm(horariosActuales);
        this.isLoading = false;
      },
      error: () => {
        this.errorCarga = "No se pudo cargar el horario actual.";
        this.isLoading = false;
      }
    });
  }

  private patchForm(horarios: HorarioHabitual[]): void {
    horarios.forEach(h => {
      const dayGroup = this.diasFormArray.controls.find(control => control.get('diaSemana')?.value === h.diaSemana);
      if (dayGroup) {
        dayGroup.patchValue({
          enabled: true,
          horaInicio: h.horaInicio.substring(0, 5),
          horaFin: h.horaFin.substring(0, 5),
          duracionTurnoMin: h.duracionTurnoMin
        });
      }
    });
    // Asegurarse que los días NO incluidos queden deshabilitados (ya empiezan en false)
    this.diasFormArray.controls.forEach(control => {
        if (!horarios.some(h => h.diaSemana === control.get('diaSemana')?.value)) {
            control.get('enabled')?.setValue(false);
        }
    });

  }

  onSubmit(): void {
    if (this.horarioForm.invalid) {
      this.avisos.error('Por favor, revisa los campos marcados en rojo.');
      // Marcar todos los campos como tocados para mostrar errores
      this.horarioForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    // Filtra solo los días habilitados y mapea al formato Input
    const formValue = this.horarioForm.value.dias as (HorarioHabitualInput & { enabled: boolean })[];
    const horarioParaEnviar: HorarioHabitualInput[] = formValue
      .filter(dia => dia.enabled)
      .map(dia => ({
        diaSemana: dia.diaSemana,
        horaInicio: dia.horaInicio,
        horaFin: dia.horaFin,
        duracionTurnoMin: dia.duracionTurnoMin
      }));

    this.agendaService.updateHorarioHabitual(horarioParaEnviar).subscribe({
      next: () => {
        this.avisos.success('Horario guardado correctamente.');
        this.isSaving = false;
        this.horarioForm.markAsPristine(); // Marcar como no modificado
      },
      error: (err) => {
        this.avisos.fallo(err, 'No se pudo guardar el horario.');
        this.isSaving = false;
      }
    });
  }
}
