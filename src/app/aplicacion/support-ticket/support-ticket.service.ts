import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  SupportTicket,
  SupportTicketCreatePayload,
  SupportTicketUpdatePayload,
} from '../../aplicacion/support-ticket/support-ticket.model';

@Injectable({
  providedIn: 'root',
})
export class SupportTicketService {
  private http = inject(HttpClient);

  private endpoint = `${environment.urlApi}supportTicket`;

  createSupportTicket(supportTicket: SupportTicketCreatePayload): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${this.endpoint}/create`,supportTicket);
  }

  updateSupportTicket(id: number,supportTicket: SupportTicketUpdatePayload): Observable<SupportTicket> {
    return this.http.put<SupportTicket>(`${this.endpoint}/${id}`,supportTicket);
  }

  getAllSupportTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.endpoint}/findall`);
  }

  getSupportTicket(id: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.endpoint}/${id}`);
  }

  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.endpoint}/me/tickets`);
  }

  // Responder cierra el ticket; el backend solo toma adminResponse.
  respondToTicket(id: number, adminResponse: string): Observable<void> {
    return this.http.post<void>(`${this.endpoint}/${id}/respond`, { adminResponse });
  }

  deleteSupportTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

}
