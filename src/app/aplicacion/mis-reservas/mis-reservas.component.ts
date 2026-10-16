import { Component, OnInit, inject } from '@angular/core';
import { Location, NgClass, UpperCasePipe, SlicePipe, DatePipe } from '@angular/common';
import { TurnoSesion } from 'src/app/models/turno/turno-sesion.model';
import { AgendaDetalleComponent } from '../agenda/agenda-detalle/agenda-detalle.component';
import { TurnosService } from 'src/app/services/turnos/turnos.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { ServerUrlPipe } from '../../pipes/server-url.pipe';
import { AvisosService } from 'src/app/core/avisos.service';

@Component({
    selector: 'app-mis-reservas',
    templateUrl: './mis-reservas.component.html',
    styleUrl: './mis-reservas.component.scss',
    imports: [MatIconButton, MatIcon, MatDivider, MatProgressSpinner, MatButton, MatCard, NgClass, MatCardContent, MatCardActions, RouterLink, UpperCasePipe, SlicePipe, DatePipe, ServerUrlPipe]
})
export class MisReservasComponent implements OnInit {
  private location = inject(Location);
  private turnosService = inject(TurnosService);
  private dialog = inject(MatDialog);
  private avisos = inject(AvisosService);

  turnos: TurnoSesion[] = [];
  isLoading = false;
  errorCarga: string | null = null;

  ngOnInit(): void {
    this.cargarMisReservas();
  }

  cargarMisReservas(): void {
    this.isLoading = true;
    this.errorCarga = null;
    this.turnosService.getMisTurnosCliente().subscribe({
      next: (data) => { this.turnos = data; this.isLoading = false; },
      error: () => { this.errorCarga = 'No se pudieron cargar tus reservas.'; this.isLoading = false; }
    });
  }

  abrirDetalle(turno: TurnoSesion): void {
    const dialogRef = this.dialog.open(AgendaDetalleComponent, {
      width: '600px',
      maxWidth: '100vw',
      panelClass: 'custom-modal-panel',
      data: { turno, modo: 'cliente' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;
      if (result.action === 'cancelar') {
        this.cancelarTurno(result.turnoId);
      } else if (result.action === 'refresh') {
        this.cargarMisReservas();
      }
    });
  }

  private cancelarTurno(turnoId: number): void {
    this.turnosService.gestionarTurno(turnoId, 'Cancelada').subscribe({
      next: (turnoActualizado) => {
        const idx = this.turnos.findIndex(t => t.id === turnoId);
        if (idx > -1) this.turnos[idx] = turnoActualizado;
        this.avisos.success('Turno cancelado correctamente.');
      },
      error: (err) => this.avisos.fallo(err, 'No se pudo cancelar el turno.')
    });
  }

  duracionMinutos(turno: TurnoSesion): number {
    const inicio = new Date(turno.fechaHoraInicio).getTime();
    const fin = new Date(turno.fechaHoraFin).getTime();
    return Math.round((fin - inicio) / 60000);
  }

  goBack(): void {
    this.location.back();
  }
}
