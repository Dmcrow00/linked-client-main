import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Especialidad } from './especialidades.model';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadCreateComponent } from './especialidad-create/especialidad-create.component';
import { EspecialidadUpdateComponent } from './especialidad-update/especialidad-update.component';
import { EspecialidadDetailComponent } from './especialidad-detail/especialidad-detail.component';
import { EspecialidadDeleteComponent } from './especialidad-delete/especialidad-delete.component';
import { MatTableModule, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'app-especialidades',
    templateUrl: './especialidades.component.html',
    styleUrl: './especialidades.component.scss',
    imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow]
})
export class EspecialidadesComponent implements OnInit, OnDestroy {
  private especialidadesService = inject(EspecialidadesService);
  private dialog = inject(MatDialog);
  private breakpointObserver = inject(BreakpointObserver);

  especialidades: Especialidad[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'desc', 'actions'];
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadEspecialidadess();
    this.setupResponsiveColumns();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupResponsiveColumns(): void {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result.matches) {
          this.displayedColumns = ['id', 'nombre', 'actions'];
        } else {
          this.displayedColumns = ['id', 'nombre', 'desc', 'actions'];
        }
      });
  }

  getCreateComponent() {
    return EspecialidadCreateComponent;
  }
  getEditComponent() {
    return EspecialidadUpdateComponent;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(EspecialidadCreateComponent, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEspecialidadess(); // Carga o actualiza la lista de Especialidadess
      }
    });
  }

  showDetails(id: number): void {
    this.especialidadesService
      .getEspecialidad(id)
      .subscribe((especialidad) => {
        const dialogRef = this.dialog.open(EspecialidadDetailComponent, {
          width: '400px',
          disableClose: true,
          data: { especialidad },
        });
      });
  }

  openEditDialog(id: number): void {
    this.especialidadesService
      .getEspecialidad(id)
      .subscribe((especialidad) => {
        const dialogRef = this.dialog.open(EspecialidadUpdateComponent, {
          width: '400px',
          disableClose: true,
          data: { especialidad },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.loadEspecialidadess(); // Carga o actualiza la lista de Especialidadess
          }
        });
      });
  }

  openDeleteDialog(id: number): void {
    const dialogRef = this.dialog.open(EspecialidadDeleteComponent, {
      width: '400px',
      disableClose: true,
      data: { id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEspecialidadess(); // Carga o actualiza la lista de Especialidadess
      }
    });
  }

  loadEspecialidadess(): void {
    this.especialidadesService.getAllEspecialidades().subscribe((data) => {
      this.especialidades = data;
    });
  }

}
