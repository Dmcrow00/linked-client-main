import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ListStore } from '@dmcrow00/ng-core/list';
import { ConfirmService } from '@dmcrow00/ng-core/ui';
import { map } from 'rxjs';
import { Especialidad } from './especialidades.model';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadDialogComponent, EspecialidadDialogData } from './especialidad-dialog/especialidad-dialog.component';

@Component({
    selector: 'app-especialidades',
    templateUrl: './especialidades.component.html',
    styleUrl: './especialidades.component.scss',
    imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, MatIconButton, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow]
})
export class EspecialidadesComponent {
  private especialidadesService = inject(EspecialidadesService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);

  readonly lista = new ListStore<Especialidad>({
    load: () => this.especialidadesService.getAllEspecialidades(),
    remove: (e) => this.especialidadesService.deleteEspecialidad(e.id),
    messages: {
      loadError: 'No se pudieron cargar las especialidades.',
      saved: 'Especialidad guardada.',
      deleted: 'Especialidad eliminada.',
      deleteError: 'No se pudo eliminar la especialidad.',
    },
  });

  // En el celular no entra la descripción.
  readonly displayedColumns = toSignal(
    inject(BreakpointObserver).observe([Breakpoints.Handset]).pipe(
      map(r => r.matches ? ['id', 'nombre', 'actions'] : ['id', 'nombre', 'desc', 'actions'])
    ),
    { initialValue: ['id', 'nombre', 'desc', 'actions'] }
  );

  openCreateDialog(): void {
    this.abrir({});
  }

  showDetails(especialidad: Especialidad): void {
    this.abrir({ especialidad, soloLectura: true });
  }

  openEditDialog(especialidad: Especialidad): void {
    this.abrir({ especialidad });
  }

  async openDeleteDialog(especialidad: Especialidad): Promise<void> {
    const seguro = await this.confirm.ask({
      title: 'Eliminar especialidad',
      message: `¿Eliminar la especialidad "${especialidad.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      danger: true,
    });
    if (seguro) await this.lista.remove(especialidad);
  }

  private abrir(data: EspecialidadDialogData): void {
    this.dialog
      .open<EspecialidadDialogComponent, EspecialidadDialogData, boolean>(EspecialidadDialogComponent, {
        width: '400px',
        disableClose: true,
        data,
      })
      .afterClosed()
      .subscribe((guardo) => {
        if (guardo) void this.lista.saved();
      });
  }
}
