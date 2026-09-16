import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TurnoMensaje } from 'src/app/models/turno/turno-mensaje.model';
import { TurnoSesion } from 'src/app/models/turno/turno-sesion.model';
import { LoginService } from 'src/app/services/auth/login.service';
import { TurnosService } from 'src/app/services/turnos/turnos.service';
import { EditarTurnoComponent } from '../editar-turno/editar-turno.component.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDivider } from '@angular/material/divider';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ServerUrlPipe } from 'src/app/pipes/server-url.pipe';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { environment } from 'src/environments/environment';

export interface AgendaDetalleData {
  turno: TurnoSesion;
  modo?: 'tatuador' | 'cliente';
}

@Component({
    selector: 'app-agenda-detalle',
    templateUrl: './agenda-detalle.component.html',
    styleUrl: './agenda-detalle.component.scss',
    imports: [MatDivider, MatTabGroup, MatTab, CdkScrollable, MatDialogContent,
              MatIconButton, MatTooltip, MatIcon, NgIf, NgFor,
              MatFormField, MatLabel, MatInput, FormsModule, MatSuffix,
              MatDialogActions, MatButton, DatePipe, ServerUrlPipe, NoDoubleSubmitDirective]
})
export class AgendaDetalleComponent implements OnInit {

  mensajes: TurnoMensaje[] = [];
  nuevoMensajeText = '';
  currentUserId: number | null = null;
  huboCambiosManuales = false;

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AgendaDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgendaDetalleData,
    private turnosService: TurnosService,
    private loginService: LoginService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.loginService.currentUserId;
    this.cargarMensajes();
  }

  get esTatuador(): boolean {
    return this.data.modo !== 'cliente';
  }

  get tatuador() {
    return this.data.turno.tatuadores?.[0];
  }

  get statusInfo(): { icon: string; mensaje: string; clase: string } {
    const mapa: Record<string, { icon: string; mensaje: string; clase: string }> = {
      'Pendiente':  { icon: 'hourglass_empty', mensaje: 'Tu solicitud está siendo revisada por el artista.',         clase: 'info-pendiente' },
      'Confirmada': { icon: 'check_circle',    mensaje: '¡Tu turno fue confirmado! Te esperamos.',                   clase: 'info-confirmada' },
      'Completada': { icon: 'done_all',        mensaje: '¡Tatuaje completado! Esperamos que hayas quedado conforme.', clase: 'info-completada' },
      'Cancelada':  { icon: 'cancel',          mensaje: 'Este turno fue cancelado.',                                  clase: 'info-cancelada' },
      'Rechazada':  { icon: 'block',           mensaje: 'El artista no pudo aceptar este turno.',                    clase: 'info-rechazada' },
      'Propuesta':  { icon: 'edit_calendar',   mensaje: 'El artista propuso una nueva fecha/hora. Revisá los detalles.', clase: 'info-propuesta' },
    };
    return mapa[this.data.turno.estado] ?? { icon: 'info', mensaje: this.data.turno.estado, clase: '' };
  }

  abrirEdicion(): void {
    const dialogEdit = this.dialog.open(EditarTurnoComponent, {
      width: '400px',
      data: { turno: this.data.turno }
    });

    dialogEdit.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarTurnoManual(result);
      }
    });
  }

  actualizarTurnoManual(datosNuevos: any): void {
    this.turnosService.updateTurno(this.data.turno.id!, datosNuevos).subscribe({
      next: (turnoActualizado) => {
        this.data.turno = turnoActualizado;
        this.huboCambiosManuales = true;
        this.snackBar.open('Turno actualizado correctamente.', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        const msg = err.error?.message || 'Ocurrió un error inesperado.';
        if (err.status === 409) {
          this.snackBar.open('El horario elegido se superpone con otro turno.', 'Entendido', { duration: 5000, panelClass: ['error-snackbar'] });
        } else {
          this.snackBar.open(`${msg}`, 'Cerrar', { duration: 5000 });
        }
      }
    });
  }

  cargarMensajes(): void {
    this.turnosService.getMensajesTurno(this.data.turno.id!).subscribe({
      next: (msgs) => { this.mensajes = msgs; },
      error: () => {}
    });
  }

  enviarMensaje(): void {
    if (!this.nuevoMensajeText.trim()) return;
    this.turnosService.enviarMensaje(this.data.turno.id!, this.nuevoMensajeText).subscribe({
      next: (mensajeCreado) => {
        this.mensajes.push(mensajeCreado);
        this.nuevoMensajeText = '';
      },
      error: () => {}
    });
  }

  cerrar(accion: 'cancelar' | 'confirmar' | 'rechazar' | 'completar' | 'restaurar' | null): void {
    if (accion === null) {
      this.dialogRef.close(this.huboCambiosManuales ? { action: 'refresh' } : null);
      return;
    }
    this.dialogRef.close({ action: accion, turnoId: this.data.turno.id });
  }

  lightboxIndex: number | null = null;

  get lightboxUrl(): string | null {
    if (this.lightboxIndex === null) return null;
    const path = this.data.turno.imagenesRef![this.lightboxIndex];
    return path.startsWith('http') ? path : `${environment.urlImg}${path}`;
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
  }

  closeLightbox(): void {
    this.lightboxIndex = null;
  }

  lightboxPrev(): void {
    if (this.lightboxIndex === null) return;
    const total = this.data.turno.imagenesRef!.length;
    this.lightboxIndex = (this.lightboxIndex - 1 + total) % total;
  }

  lightboxNext(): void {
    if (this.lightboxIndex === null) return;
    const total = this.data.turno.imagenesRef!.length;
    this.lightboxIndex = (this.lightboxIndex + 1) % total;
  }
}
