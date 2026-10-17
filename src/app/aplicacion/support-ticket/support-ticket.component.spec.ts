import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmService } from '@dmcrow00/ng-core/ui';
import { of } from 'rxjs';

import { SupportTicket } from './support-ticket.model';
import { SupportTicketService } from './support-ticket.service';
import { SupportTicketComponent } from './support-ticket.component';

const ticket = (id: number, status: boolean, usuario: string): SupportTicket => ({
  ...new SupportTicket(),
  id,
  status,
  description: `Ticket ${id}`,
  usuarios: [usuario],
  creationTimestamp: '2026-10-15T10:00:00',
});

describe('SupportTicketComponent', () => {
  let service: jasmine.SpyObj<SupportTicketService>;

  beforeEach(() => {
    service = jasmine.createSpyObj<SupportTicketService>('SupportTicketService', ['getAllSupportTickets', 'deleteSupportTicket']);
    service.getAllSupportTickets.and.returnValue(of([ticket(1, true, 'ana'), ticket(2, false, 'bruno'), ticket(3, true, 'bruno')]));
    service.deleteSupportTicket.and.returnValue(of(undefined));
    TestBed.configureTestingModule({
      imports: [SupportTicketComponent],
      providers: [provideNoopAnimations(), provideNativeDateAdapter(), { provide: MatDialog, useValue: { open: () => undefined } }],
    }).overrideProvider(SupportTicketService, { useValue: service });
  });

  async function crear() {
    const fixture = TestBed.createComponent(SupportTicketComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('un ticket abierto (status true) se ve PENDIENTE y uno cerrado, RESUELTO', async () => {
    const fixture = await crear();
    const estados = Array.from(fixture.nativeElement.querySelectorAll('td.mat-column-status')).map((td) => (td as HTMLElement).textContent?.trim());
    expect(estados).toEqual(['PENDIENTE', 'RESUELTO', 'PENDIENTE']);
  });

  it('"Buscar" filtra por estado y usuario sobre la lista cargada', async () => {
    const fixture = await crear();
    const pantalla = fixture.componentInstance;

    pantalla.filtro = { usuario: 'bru', fecha: null, abierto: true };
    pantalla.aplicarFiltro();
    expect(pantalla.filteredTickets().map((t) => t.id)).toEqual([3]);

    pantalla.filtro = { usuario: '', fecha: null, abierto: false };
    pantalla.aplicarFiltro();
    expect(pantalla.filteredTickets().map((t) => t.id)).toEqual([2]);

    pantalla.resetFiltro();
    expect(pantalla.filteredTickets().length).toBe(3);
    expect(service.getAllSupportTickets).toHaveBeenCalledTimes(1);
  });

  it('borrar pide confirmación y, si se confirma, borra y recarga', async () => {
    const fixture = await crear();
    const confirm = TestBed.inject(ConfirmService);
    spyOn(confirm, 'ask').and.resolveTo(true);

    await fixture.componentInstance.openDeleteDialog(ticket(2, false, 'bruno'));

    expect(confirm.ask).toHaveBeenCalledWith(jasmine.objectContaining({ danger: true }));
    expect(service.deleteSupportTicket).toHaveBeenCalledWith(2);
    expect(service.getAllSupportTickets).toHaveBeenCalledTimes(2);
  });

  it('si no se confirma, no borra', async () => {
    const fixture = await crear();
    spyOn(TestBed.inject(ConfirmService), 'ask').and.resolveTo(false);
    await fixture.componentInstance.openDeleteDialog(ticket(2, false, 'bruno'));
    expect(service.deleteSupportTicket).not.toHaveBeenCalled();
  });
});
