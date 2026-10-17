import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { TurnoSesion } from 'src/app/models/turno/turno-sesion.model';
import { LoginService } from 'src/app/services/auth/login.service';
import { AgendaService } from '../agenda.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatSelect, MatOption } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { AvisosService } from 'src/app/core/avisos.service';

@Component({
    selector: 'app-editar-turno',
    templateUrl: './editar-turno.component.html',
    styleUrl: './editar-turno.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatSelect, MatOption, MatProgressSpinner, MatError, MatDialogActions, MatButton, MatDialogClose, DatePipe, NoDoubleSubmitDirective]
})
export class EditarTurnoComponent implements OnInit {
  private avisos = inject(AvisosService);
private fb = inject(FormBuilder);
dialogRef = inject<MatDialogRef<EditarTurnoComponent>>(MatDialogRef);
private loginService = inject(LoginService);
private agendaService = inject(AgendaService);
data = inject<{
    turno: TurnoSesion;
}>(MAT_DIALOG_DATA);

form: FormGroup;
horariosDisponibles: string[] = [];
isLoadingHorarios = false;
tatuadorId: number | null = null;
minDate: Date = new Date();

  constructor() {
    const data = this.data;

    const fecha = new Date(data.turno.fechaHoraInicio);
    const user = this.loginService.currentUserId;
    this.tatuadorId = user;

    // Formateamos la hora para el input type="time" (HH:mm)
    const horaStr = fecha.toTimeString().substring(0, 5);
    if (data.turno.tatuadores && data.turno.tatuadores.length > 0) {
        this.tatuadorId = data.turno.tatuadores[0].id;
    }

    this.form = this.fb.group({
      fecha: [fecha, Validators.required],
      hora: [horaStr, Validators.required],
      estado: [data.turno.estado, Validators.required]
    });
  }

  get fecha(): AbstractControl | null { return this.form.get('fecha'); }
  get hora(): AbstractControl | null { return this.form.get('hora'); }

  ngOnInit(): void {
    // Cargar horarios iniciales (para la fecha que ya tiene el turno)
    this.cargarHorarios();

    // Escuchar cambios de fecha para recargar los horarios
    this.form.get('fecha')?.valueChanges.subscribe(() => {
      this.form.get('hora')?.setValue(''); // Limpiar hora vieja porque quizás no sirve
      this.cargarHorarios();
    });
  }

  cargarHorarios(fechaParam?: Date): void {
    const fechaBusqueda = fechaParam || this.fecha?.value;
    
    if (!fechaBusqueda || !this.tatuadorId) return;

    this.isLoadingHorarios = true;
    this.horariosDisponibles = [];
  
    this.agendaService.getHorariosDisponibles(this.tatuadorId, fechaBusqueda)
      .subscribe({
        next: (slots) => {
          this.horariosDisponibles = slots;
          this.isLoadingHorarios = false;
        },
        error: (err) => {
          this.avisos.fallo(err, 'No se pudieron cargar los horarios disponibles.');
          this.isLoadingHorarios = false;
        }
      });
  }

  guardar(): void {
    if (this.form.valid) {
      const fechaVal = this.form.value.fecha;
      const horaVal = this.form.value.hora; 
      const nuevaFechaInicio = new Date(fechaVal);
      const [hours, minutes] = horaVal.split(':');
      nuevaFechaInicio.setHours(+hours, +minutes, 0, 0);

      this.dialogRef.close({
        fechaHoraInicio: nuevaFechaInicio.toISOString(),
        estado: this.form.value.estado
      });
    }
  }
}
