import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

import { AvisosService } from 'src/app/core/avisos.service';
import { SupportTicket } from '../support-ticket.model';
import { SupportTicketService } from '../support-ticket.service';
import { SupportTicketCreateComponent } from '../support-ticket-create/support-ticket-create.component';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss'],
  imports: [
    DatePipe,
    MatFabButton,
    MatIconButton,
    MatIcon,
    MatTooltip
],
})
export class SoporteComponent implements OnInit {
  private supportTicketService = inject(SupportTicketService);
  private dialog = inject(MatDialog);
  private location = inject(Location);
  private avisos = inject(AvisosService);


  myTickets: SupportTicket[] = [];
  loadingTickets = true;

  ngOnInit(): void {
    this.loadMyTickets();
  }

  loadMyTickets(): void {
    this.loadingTickets = true;
    this.supportTicketService.getMyTickets().subscribe({
      next: (tickets) => { this.myTickets = tickets; this.loadingTickets = false; },
      error: (err) => {
        this.loadingTickets = false;
        this.avisos.fallo(err, 'No se pudieron cargar tus tickets.');
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  openNuevoTicket(): void {
    const ref = this.dialog.open(SupportTicketCreateComponent, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
    });
    ref.afterClosed().subscribe((created) => {
      if (created) this.loadMyTickets();
    });
  }
}
