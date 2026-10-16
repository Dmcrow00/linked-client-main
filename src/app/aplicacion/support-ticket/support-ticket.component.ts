import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SupportTicket } from './support-ticket.model';
import { SupportTicketService } from './support-ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { SupportTicketDetailComponent } from './support-ticket-detail/support-ticket-detail.component';
import { SupportTicketDeleteComponent } from './support-ticket-delete/support-ticket-delete.component';
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
export class SupportTicketComponent implements OnInit, OnDestroy {
  private supportTicketService = inject(SupportTicketService);
  private dialog = inject(MatDialog);
  private breakpointObserver = inject(BreakpointObserver);
  private location = inject(Location);

  supportTickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  private destroy$ = new Subject<void>();

  filterFechaCarga: Date | null = null;
  filterUsuario: string | null = null;
  filterEstadoTicket: boolean | null = null;

  displayedColumns: string[] = ['id', 'fechaCarga', 'user', 'status', 'actions'];

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.loadSupportTickets();
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
        this.displayedColumns = result.matches
          ? ['id', 'fechaCarga', 'status', 'actions']
          : ['id', 'fechaCarga', 'user', 'status', 'actions'];
      });
  }

  showDetails(id: number): void {
    this.supportTicketService.getSupportTicket(id).subscribe((supportTicket) => {
      const dialogRef = this.dialog.open(SupportTicketDetailComponent, {
        width: '780px',
        maxWidth: '95vw',
        disableClose: true,
        data: { supportTicket },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadSupportTickets();
        }
      });
    });
  }

  openDeleteDialog(id: number): void {
    const dialogRef = this.dialog.open(SupportTicketDeleteComponent, {
      width: '400px',
      disableClose: true,
      data: { id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadSupportTickets();
      }
    });
  }

  loadSupportTickets(): void {
    this.supportTicketService.getAllSupportTickets().subscribe((data) => {
      this.supportTickets = data;
      this.filteredTickets = data;
    });
  }

  aplicarFiltro(): void {
    this.filteredTickets = this.supportTickets.filter(ticket => {
      let d1: string | null = null;
      let d2: string | null = null;

      if (ticket.creationTimestamp && this.filterFechaCarga) {
        d1 = new Date(ticket.creationTimestamp).toISOString().split('T')[0];
        d2 = this.filterFechaCarga.toISOString().split('T')[0];
      }

      const usuario = this.filterUsuario?.toLowerCase();
      const coincideUsuario =
        !usuario || (ticket.usuarios ?? []).some(u => u.toLowerCase().includes(usuario));

      const coincideFecha = !this.filterFechaCarga || d1 === d2;

      const coincideEstado =
        this.filterEstadoTicket === null || ticket.status === this.filterEstadoTicket;

      return coincideUsuario && coincideFecha && coincideEstado;
    });
  }

  resetFiltro(): void {
    this.filterUsuario = '';
    this.filterFechaCarga = null;
    this.filterEstadoTicket = null;
    this.filteredTickets = [...this.supportTickets];
  }

  onDateInput(event: any) {
    let value: string = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5, 9);
    event.target.value = value;
  }
}
