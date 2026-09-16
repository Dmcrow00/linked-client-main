import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe, Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { MatDialog } from '@angular/material/dialog';
import { SolicitudTatuadorService, SolicitudTatuador } from 'src/app/services/solicitud-tatuador/solicitud-tatuador.service';
import { EspecialidadesService } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.service';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';
import { UserService } from 'src/app/services/user/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-solicitudes-tatuador',
  templateUrl: './solicitudes-tatuador.component.html',
  styleUrls: ['./solicitudes-tatuador.component.scss'],
  imports: [NgFor, NgIf, DatePipe, MatIcon, MatButton, MatIconButton, NoDoubleSubmitDirective],
})
export class SolicitudesTatuadorComponent implements OnInit {
  @Input() showHero = true;
  solicitudes: SolicitudTatuador[] = [];
  especialidadesMap: Map<number, string> = new Map();
  loading = true;
  private tatuadoresIds: Set<number> = new Set();

  constructor(
    private service: SolicitudTatuadorService,
    private espService: EspecialidadesService,
    private userService: UserService,
    private dialog: MatDialog,
    private location: Location
  ) { }

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.espService.getAllEspecialidades().subscribe((esps: Especialidad[]) => {
      esps.forEach(e => this.especialidadesMap.set(e.id, e.nombre));
      this.loadSolicitudes();
    });
  }

  loadSolicitudes(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: async (data) => {
        this.solicitudes = data;
        await this.checkRolesTatuador(data.filter(s => s.status === 'pendiente'));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private async checkRolesTatuador(pendientes: SolicitudTatuador[]): Promise<void> {
    const allRoles = await firstValueFrom(this.userService.getRoles());
    const tatuadorId = allRoles?.find(r => r.description === 'Tatuador')?.id;
    if (tatuadorId == null) return;

    this.tatuadoresIds.clear();
    await Promise.all(pendientes.map(async (sol) => {
      const roles = await firstValueFrom(this.userService.getAllUserRoles(sol.user.id));
      if ((roles ?? []).some(r => Number(r) === Number(tatuadorId))) {
        this.tatuadoresIds.add(sol.user.id);
      }
    }));
  }

  get pendientes(): SolicitudTatuador[] {
    return this.solicitudes.filter(s => s.status === 'pendiente' && !this.tatuadoresIds.has(s.user.id));
  }

  get procesadas(): SolicitudTatuador[] {
    return this.solicitudes.filter(s => s.status !== 'pendiente');
  }

  // El backend guarda los IDs como arreglo JSON serializado, por ejemplo "[1, 3]".
  getNombresEspecialidades(idsJson: string | null): string {
    if (!idsJson) return '—';
    let ids: number[] = [];
    try {
      ids = JSON.parse(idsJson);
    } catch {
      return '—';
    }
    if (!ids?.length) return '—';
    return ids.map(id => this.especialidadesMap.get(id) ?? `#${id}`).join(', ');
  }

  aprobar(sol: SolicitudTatuador): void {
    this.service.aprobar(sol.id).subscribe({
      next: () => {
        this.dialog.open(ErrorDialogComponent, {
          data: { message: `Solicitud de ${sol.user.username} aprobada`, type: 'success' }
        });
        this.loadSolicitudes();
      },
      error: (err) => {
        this.dialog.open(ErrorDialogComponent, {
          data: { message: err.error?.message || 'Error al aprobar', type: 'error' }
        });
      }
    });
  }

  rechazar(sol: SolicitudTatuador): void {
    this.service.rechazar(sol.id).subscribe({
      next: () => {
        this.dialog.open(ErrorDialogComponent, {
          data: { message: `Solicitud de ${sol.user.username} rechazada`, type: 'error' }
        });
        this.loadSolicitudes();
      },
      error: (err) => {
        this.dialog.open(ErrorDialogComponent, {
          data: { message: err.error?.message || 'Error al rechazar', type: 'error' }
        });
      }
    });
  }
}
