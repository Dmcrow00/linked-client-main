import { Component, Input, OnInit, inject } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { SolicitudTatuadorService, SolicitudTatuador } from 'src/app/services/solicitud-tatuador/solicitud-tatuador.service';
import { EspecialidadesService } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.service';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { AvisosService } from 'src/app/core/avisos.service';
import { UserService } from 'src/app/services/user/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-solicitudes-tatuador',
  templateUrl: './solicitudes-tatuador.component.html',
  styleUrls: ['./solicitudes-tatuador.component.scss'],
  imports: [DatePipe, MatIcon, MatButton, MatIconButton, NoDoubleSubmitDirective],
})
export class SolicitudesTatuadorComponent implements OnInit {
  private service = inject(SolicitudTatuadorService);
  private espService = inject(EspecialidadesService);
  private userService = inject(UserService);
  private avisos = inject(AvisosService);
  private location = inject(Location);

  @Input() showHero = true;
  solicitudes: SolicitudTatuador[] = [];
  especialidadesMap = new Map<number, string>();
  loading = true;
  private tatuadoresIds = new Set<number>();

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.espService.getAllEspecialidades().subscribe({
      next: (esps: Especialidad[]) => {
        esps.forEach(e => this.especialidadesMap.set(e.id, e.nombre));
        this.loadSolicitudes();
      },
      // Sin los nombres, las especialidades se ven por número: las solicitudes se cargan igual.
      error: (err) => {
        this.avisos.fallo(err, 'No se pudieron cargar las especialidades.');
        this.loadSolicitudes();
      },
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
      error: (err) => {
        this.loading = false;
        this.avisos.fallo(err, 'No se pudieron cargar las solicitudes.');
      }
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
        this.avisos.success(`Solicitud de ${sol.user.username} aprobada`);
        this.loadSolicitudes();
      },
      error: (err) => this.avisos.fallo(err, 'Error al aprobar')
    });
  }

  rechazar(sol: SolicitudTatuador): void {
    this.service.rechazar(sol.id).subscribe({
      next: () => {
        this.avisos.info(`Solicitud de ${sol.user.username} rechazada`);
        this.loadSolicitudes();
      },
      error: (err) => this.avisos.fallo(err, 'Error al rechazar')
    });
  }
}
