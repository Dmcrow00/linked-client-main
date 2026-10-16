import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SupportTicket } from './support-ticket.model';
import { SupportTicketService } from './support-ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { SupportTicketDetailComponent } from './support-ticket-detail/support-ticket-detail.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { DatePipe, Location } from '@angular/common';
import { ListStore } from '@dmcrow00/ng-core/list';
import { ConfirmService } from '@dmcrow00/ng-core/ui';

/** Los filtros del panel: se aplican sobre la lista ya cargada al tocar "Buscar". */
interface FiltroTickets {
  usuario: string;
  fecha: Date | null;
  /** true: abiertos (pendientes); false: resueltos; null: todos. */
  abierto: boolean | null;
}

const SIN_FILTRO: FiltroTickets = { usuario: '', fecha: null, abierto: null };

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.component.html',
  styleUrls: ['./support-ticket.component.scss'],
  imports: [
    MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle,
    MatIcon, FormsModule,
    MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker,
    MatSelect, MatOption,
    MatButton, MatIconButton, MatTooltip,
    MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell,
    MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    DatePipe
  ],
})
export class SupportTicketComponent {
  private supportTicketService = inject(SupportTicketService);
  private dialog = inject(MatDialog);
  private confirm = inject(ConfirmService);
  private location = inject(Location);

  readonly lista = new ListStore<SupportTicket>({
    load: () => this.supportTicketService.getAllSupportTickets(),
    remove: (t) => this.supportTicketService.deleteSupportTicket(t.id),
    messages: {
      loadError: 'No se pudieron cargar los tickets.',
      saved: 'Respuesta enviada.',
      deleted: 'Ticket eliminado.',
      deleteError: 'No se pudo eliminar el ticket.',
    },
  });

  // Lo que se edita en el panel de filtros y lo que se aplicó con "Buscar".
  filtro: FiltroTickets = { ...SIN_FILTRO };
  private readonly aplicado = signal<FiltroTickets>(SIN_FILTRO);

  readonly filteredTickets = computed(() => {
    const { usuario, fecha, abierto } = this.aplicado();
    const buscado = usuario.trim().toLowerCase();
    const dia = fecha ? this.dia(fecha) : null;
    return this.lista.items().filter(ticket =>
      (!buscado || (ticket.usuarios ?? []).some(u => u.toLowerCase().includes(buscado))) &&
      (!dia || (!!ticket.creationTimestamp && this.dia(new Date(ticket.creationTimestamp)) === dia)) &&
      (abierto === null || ticket.status === abierto)
    );
  });

  readonly displayedColumns = toSignal(
    inject(BreakpointObserver).observe([Breakpoints.Handset]).pipe(
      map(r => r.matches
        ? ['id', 'fechaCarga', 'status', 'actions']
        : ['id', 'fechaCarga', 'user', 'status', 'actions'])
    ),
    { initialValue: ['id', 'fechaCarga', 'user', 'status', 'actions'] }
  );

  goBack(): void { this.location.back(); }

  showDetails(supportTicket: SupportTicket): void {
    this.dialog
      .open(SupportTicketDetailComponent, {
        width: '780px',
        maxWidth: '95vw',
        disableClose: true,
        data: { supportTicket },
      })
      .afterClosed()
      .subscribe((respondio) => {
        if (respondio) void this.lista.saved();
      });
  }

  async openDeleteDialog(ticket: SupportTicket): Promise<void> {
    const seguro = await this.confirm.ask({
      title: 'Eliminar ticket',
      message: `¿Eliminar el ticket #${ticket.id}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      danger: true,
    });
    if (seguro) await this.lista.remove(ticket);
  }

  aplicarFiltro(): void {
    this.aplicado.set({ ...this.filtro });
  }

  resetFiltro(): void {
    this.filtro = { ...SIN_FILTRO };
    this.aplicado.set(SIN_FILTRO);
  }

  onDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value: string = input.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    input.value = value;
  }

  /** El día local (aaaa-mm-dd), para comparar fechas sin la hora ni el corrimiento de UTC. */
  private dia(fecha: Date): string {
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }
}
