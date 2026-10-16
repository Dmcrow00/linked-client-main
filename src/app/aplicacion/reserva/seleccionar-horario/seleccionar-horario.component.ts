import { Component, OnInit, inject } from '@angular/core';
import { Tatuador } from 'src/app/models/tatuador/tatuador.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TatuadorService } from 'src/app/services/user/tatuador.service';
import { AgendaService } from '../../agenda/agenda.service';
import { SolicitarTurnoDto, TurnosService } from 'src/app/services/turnos/turnos.service';
import { ReservaStateService } from 'src/app/services/reserva/reserva-state.service';
import { MatIconButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatCalendar } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-seleccionar-horario',
    templateUrl: './seleccionar-horario.component.html',
    styleUrl: './seleccionar-horario.component.scss',
    imports: [MatIconButton, MatRipple, MatIcon, MatCalendar, FormsModule, NoDoubleSubmitDirective]
})
export class SeleccionarHorarioComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private tatuadorService = inject(TatuadorService);
  private agendaService = inject(AgendaService);
  private turnosService = inject(TurnosService);
  private reservaStateService = inject(ReservaStateService);


  minDate: Date;
  maxDate: Date;
  isSaving = false;

  constructor(){
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);

    // Cargamos los próximos 6 meses
    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 6);
  }

  // Datos del Turno
  selectedTatuador: Tatuador | null = null;
  tatuadorId: number | null = null;
  selectedDate: Date | null = null;
  selectedTime: string = '';

  // Horarios
  horarios: string[] = [];
  isLoadingHorarios = false;
  errorHorarios: string | null = null;

  // Fechas bloqueadas
  private fechasBloqueadasSet = new Set<string>();
  isLoadingFechas = false;

  // Descripción
  descripcionCliente: string = '';

  // Imágenes
  selectedFiles: File[] = [];
  previewImages: string[] = [];
  maxFiles = 3;

  /** Función que MatCalendar usa para habilitar/deshabilitar fechas */
  readonly dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const iso = date.toISOString().split('T')[0];
    return !this.fechasBloqueadasSet.has(iso);
  };

  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('tatuadorId');
    if (idStr) {
      this.tatuadorId = +idStr;
      this.tatuadorService.getTatuadores().subscribe(tatuadores => {
        this.selectedTatuador = tatuadores.find(t => t.id === this.tatuadorId) || null;
        if (!this.selectedTatuador) {
          this.router.navigate(['/reserva/listado']);
        } else {
          this.cargarFechasBloqueadas();
        }
      });
    } else {
      this.router.navigate(['/reserva/listado']);
    }

    const imgs = this.reservaStateService.getImagenes();
    if (imgs.length > 0) {
      this.selectedFiles = [...imgs];
      imgs.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  private cargarFechasBloqueadas(): void {
    if (!this.tatuadorId) return;
    this.isLoadingFechas = true;

    this.agendaService.getFechasBloqueadas(this.tatuadorId, this.minDate, this.maxDate).subscribe({
      next: (fechas) => {
        this.fechasBloqueadasSet = new Set(fechas);
        this.isLoadingFechas = false;
      },
      error: () => {
        // No bloquear el flujo si falla — el backend igual valida al confirmar
        this.isLoadingFechas = false;
      }
    });
  }

  onDateSelected(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.horarios = [];
    this.selectedTime = '';
    this.isLoadingHorarios = true;
    this.errorHorarios = null;

    if (!this.tatuadorId) return;

    this.agendaService.getHorariosDisponibles(this.tatuadorId, date).subscribe({
      next: (slots) => {
        this.horarios = slots;
        this.isLoadingHorarios = false;
        if (slots.length === 0) {
          this.errorHorarios = 'No hay horarios disponibles para este día.';
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoadingHorarios = false;
        this.errorHorarios = 'Error al cargar los horarios del tatuador.';
      }
    });
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  isTimeSelected(time: string): boolean {
    return this.selectedTime === time;
  }

  canConfirm(): boolean {
    return !!(this.selectedDate && this.selectedTime && this.descripcionCliente.trim() !== '' && this.selectedFiles.length > 0);
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewImages.splice(index, 1);
  }

  onFileSelected(event: any): void {
    const files = event.target.files;

    if (files) {
      const totalFiles = this.selectedFiles.length + files.length;

      if (totalFiles > this.maxFiles) {
        alert(`Solo puedes subir un máximo de ${this.maxFiles} imágenes.`);
        event.target.value = null;
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }

    event.target.value = null;
  }

  confirmarReserva(): void {
    if (!this.canConfirm() || !this.selectedDate || !this.tatuadorId) {
      alert("Por favor, completa la fecha, hora, descripción y sube al menos una imagen.");
      return;
    }
    this.isSaving = true;

    const [hInicio, mInicio] = this.selectedTime.split(':');
    const fechaHoraInicio = new Date(this.selectedDate);
    fechaHoraInicio.setHours(parseInt(hInicio), parseInt(mInicio), 0, 0);

    const fechaHoraFin = new Date(fechaHoraInicio);
    fechaHoraFin.setMinutes(fechaHoraFin.getMinutes() + 60);

    // El backend parsea ISO local sin zona horaria.
    const solicitudDto: SolicitarTurnoDto = {
      tatuadorId: this.tatuadorId,
      fechaHoraInicio: this.aIsoLocal(fechaHoraInicio),
      fechaHoraFin: this.aIsoLocal(fechaHoraFin),
      descripcionCliente: this.descripcionCliente
    };

    this.turnosService.solicitarTurno(solicitudDto, this.selectedFiles).subscribe({
      next: (turnoCreado) => {
        const datosParaConfirmar = {
            tatuador: this.selectedTatuador,
            fechaHoraInicio: fechaHoraInicio.toISOString(),
        };

        this.reservaStateService.setDatos(datosParaConfirmar);
        this.reservaStateService.clearImagenes();

        this.router.navigate(['/reserva/confirmacion']);
      },
      error: (err) => {
        console.error(err);
        alert(`Error: ${err.error?.message || 'No se pudo procesar la solicitud.'}`);
        this.isSaving = false;
      }
    });
  }

  // toISOString() convierte a UTC y correría el turno; el backend espera la hora local elegida.
  private aIsoLocal(fecha: Date): string {
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}` +
           `T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:00`;
  }

  getPhotoUrl(photo?: string): string {
    if (!photo) return 'assets/images/default-profile.jpg';
    if (photo.startsWith('http')) return photo;
    return environment.urlImg + photo;
  }

  goBack(): void {
    this.location.back();
  }
}
