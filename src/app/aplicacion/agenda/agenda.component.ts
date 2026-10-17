import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GestionarHorarioComponent } from './gestionar-horario/gestionar-horario.component';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from '@angular/material/table';
import { TurnoSesion } from 'src/app/models/turno/turno-sesion.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TurnosService } from 'src/app/services/turnos/turnos.service';
import { AgendaDetalleComponent } from './agenda-detalle/agenda-detalle.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EditarTurnoComponent } from './editar-turno/editar-turno.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgClass, DatePipe, Location } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { AvisosService } from 'src/app/core/avisos.service';
import { ConfirmService } from '@dmcrow00/ng-core/ui';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  imports: [MatButton, MatIcon, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatProgressSpinner, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, NgClass, MatIconButton, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatPaginator, DatePipe]
})
export class AgendaComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private turnosService = inject(TurnosService);
  private avisos = inject(AvisosService);
  private confirm = inject(ConfirmService);
  private breakpointObserver = inject(BreakpointObserver);
  private location = inject(Location);


  displayedColumns: string[] = ['fecha', 'hora', 'cliente', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<TurnoSesion>([]);

  filteredTurnos: TurnoSesion[] = [];

  // Filtros
  filterEstado = '';
  filterUsername = '';
  filterFechaDesde: Date | null = null;
  filterFechaHasta: Date | null = null;
  today = new Date();

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    if (mp) {
      this.dataSource.paginator = mp;
    }
  }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    if (ms) {
      this.dataSource.sort = ms;
      this.configurarOrdenamiento(); // Llamamos a la configuración aquí
    }
  }

  isLoadingTurnos = false;
  errorTurnos: string | null = null;
  private destroy$ = new Subject<void>();

  goBack(): void { this.location.back(); }

  configurarFiltro() {
    this.dataSource.filterPredicate = (data: TurnoSesion, filter: string) => {

      // Parseamos el string del filtro de vuelta a un objeto
      const searchTerms = JSON.parse(filter);

      // Filtro por Estado
      const coincideEstado = !searchTerms.estado ||
        data.estado?.toLowerCase() === searchTerms.estado.toLowerCase();

      // Filtro por Cliente (Username, Nombre o Apellido)
      const nombreCliente = (
        (data.cliente?.username || '') + ' ' +
        (data.cliente?.realname || '') + ' ' +
        (data.cliente?.surname || '')
      ).toLowerCase();

      const coincideNombre = !searchTerms.username ||
        nombreCliente.includes(searchTerms.username.toLowerCase());

      // Filtro por Fecha
      const fechaTurno = new Date(data.fechaHoraInicio);
      fechaTurno.setHours(0, 0, 0, 0); // Ignorar hora para comparar días

      let coincideFecha = true;
      if (searchTerms.fechaDesde) {
        const desde = new Date(searchTerms.fechaDesde);
        desde.setHours(0, 0, 0, 0);
        coincideFecha = coincideFecha && (fechaTurno >= desde);
      }
      if (searchTerms.fechaHasta) {
        const hasta = new Date(searchTerms.fechaHasta);
        hasta.setHours(0, 0, 0, 0);
        coincideFecha = coincideFecha && (fechaTurno <= hasta);
      }

      return coincideEstado && coincideNombre && coincideFecha;
    };
  }

  aplicarFiltro(): void {
    if (this.filterFechaDesde && this.filterFechaHasta && this.filterFechaDesde > this.filterFechaHasta) {
      this.avisos.error('La fecha "desde" no puede ser mayor que la fecha "hasta".');
      return;
    }

    // Creamos el objeto de filtro
    const filterValues = {
      estado: this.filterEstado,
      username: this.filterUsername,
      fechaDesde: this.filterFechaDesde,
      fechaHasta: this.filterFechaHasta
    };

    // Se lo pasamos al dataSource como string (esto dispara el filterPredicate)
    this.dataSource.filter = JSON.stringify(filterValues);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  resetFiltro(): void {
    this.filterEstado = '';
    this.filterUsername = '';
    this.filterFechaDesde = null;
    this.filterFechaHasta = null;
    this.dataSource.filter = ''; // Resetea el filtro
  }

  // Validadores para los Datepickers (Min/Max)
  filterDesde = (d: Date | null): boolean => {
    if (!d) return false;
    return !this.filterFechaHasta || d <= this.filterFechaHasta;
  };

  filterHasta = (d: Date | null): boolean => {
    if (!d) return false;
    return !this.filterFechaDesde || d >= this.filterFechaDesde;
  };

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Tu lógica para formatear input manual de fecha
    let value: string = input.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    input.value = value;
  }

  ngOnInit(): void {
    this.loadTurnos();
    this.setupResponsiveColumns();
    this.configurarFiltro();
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
          this.displayedColumns = ['fecha', 'hora', 'estado', 'acciones'];
        } else {
          this.displayedColumns = ['fecha', 'hora', 'cliente', 'estado', 'acciones'];
        }
      });
  }

  abrirConfiguracionHorario(): void {
    this.dialog.open(GestionarHorarioComponent, {
      panelClass: 'horario-dialog', disableClose: true,
    });
  }



  configurarOrdenamiento() {
    this.dataSource.sortingDataAccessor = (item: TurnoSesion, property: string): string | number => {
      switch (property) {
        case 'fecha':
        case 'hora':
          // Convertir a timestamp para ordenar números correctamente
          return new Date(item.fechaHoraInicio).getTime();
        case 'cliente':
          return (item.cliente?.realname || '').toLowerCase();
        case 'estado':
          return (item.estado || '').toLowerCase();
        default:
          return String(item[property as keyof TurnoSesion] ?? '');
      }
    };
  }

  //Logica de turnos

  loadTurnos(): void {
    this.isLoadingTurnos = true;
    this.errorTurnos = null;

    this.turnosService.getMisTurnos().subscribe({
      next: (turnos: TurnoSesion[]) => {
        this.dataSource.data = turnos;
        this.isLoadingTurnos = false;
      },
      error: () => {
        this.errorTurnos = "No se pudieron cargar los turnos.";
        this.isLoadingTurnos = false;
      }
    });
  }

  // Filtro para la tabla 
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Configura el filtro para buscar en datos anidados
    this.dataSource.filterPredicate = (data: TurnoSesion, filter: string) => {
      const dataStr =
        (data.cliente?.realname || '') +
        (data.cliente?.surname || '') +
        data.estado +
        new Date(data.fechaHoraInicio).toLocaleDateString('es-AR'); // "dd/MM/yyyy"
      return dataStr.toLowerCase().includes(filter);
    };

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  verDetalleTurno(turno: TurnoSesion): void {
    const dialogRef = this.dialog.open(AgendaDetalleComponent, {
      width: '600px',
      data: { turno, modo: 'tatuador' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'confirmar') {
          this.gestionarTurno(result.turnoId, 'Confirmada');
        } else if (result.action === 'rechazar') {
          this.gestionarTurno(result.turnoId, 'Rechazada');
        } else if (result.action === 'completar') {
          this.gestionarTurno(result.turnoId, 'Completada');
        }
        else if (result.action === 'restaurar') {
          this.gestionarTurno(result.turnoId, 'Pendiente');
        }
      }
    });
  }

  aceptarTurno(turno: TurnoSesion): void {
    this.gestionarTurno(turno.id!, 'Confirmada');
  }

  /*rechazarTurno(turno: TurnoSesion): void {
    // TODO: Pedir un motivo
    // Por ahora, lo rechazamos directamente
    this.gestionarTurno(turno.id!, 'Rechazada');
  }*/

  completarTurno(turno: TurnoSesion): void {
    this.gestionarTurno(turno.id!, 'Completada');
  }

  private gestionarTurno(id: number, nuevoEstado: string): void {
    this.turnosService.gestionarTurno(id, nuevoEstado).subscribe({
      next: (turnoActualizado) => {
        this.avisos.success(`Turno ${nuevoEstado.toLowerCase()} correctamente.`);
        const index = this.dataSource.data.findIndex(t => t.id === id);
        if (index > -1) {
          this.dataSource.data[index] = turnoActualizado;
          this.dataSource._updateChangeSubscription(); // Forzar refresco de la tabla
        } else {
          this.loadTurnos(); // Fallback por si no lo encuentra
        }
      },
      error: (err) => this.avisos.fallo(err, 'No se pudo actualizar el turno.')
    });
  }

  // Método para abrir el diálogo de edición
  editarTurno(turno: TurnoSesion): void {
    const dialogRef = this.dialog.open(EditarTurnoComponent, {
      width: '400px',
      data: { turno: turno }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Llamar al servicio para actualizar los datos completos
        // Necesitarás un método updateTurnoCompleto en tu servicio
        // O usar gestionarTurno si solo cambió el estado, pero aquí cambiamos fecha también
        //this.actualizarTurnoCompleto(turno.id!, result);
      }
    });
  }

  // Método para restaurar (deshacer rechazo)
  async restaurarTurno(turno: TurnoSesion): Promise<void> {
    if (await this.confirm.ask({ title: 'Restaurar turno', message: '¿Deseas restaurar este turno al estado Pendiente?', confirmText: 'Restaurar' })) {
      this.gestionarTurno(turno.id!, 'Pendiente');
    }
  }

  // 3. Modificar rechazarTurno para agregar confirmación
  async rechazarTurno(turno: TurnoSesion): Promise<void> {
    const seguro = await this.confirm.ask({
      title: 'Rechazar turno',
      message: `¿Estás seguro de RECHAZAR el turno de ${turno.cliente?.realname}?`,
      confirmText: 'Rechazar',
      danger: true,
    });
    if (seguro) {
      this.gestionarTurno(turno.id!, 'Rechazada');
    }
  }

}
