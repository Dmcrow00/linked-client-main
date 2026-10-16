import { ApiResponse, unwrap } from '@dmcrow00/ng-core/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
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
    return this.http.post<ApiResponse<SupportTicket>>(`${this.endpoint}/create`,supportTicket).pipe(map(unwrap));
  }

  updateSupportTicket(id: number,supportTicket: SupportTicketUpdatePayload): Observable<SupportTicket> {
    return this.http.put<ApiResponse<SupportTicket>>(`${this.endpoint}/${id}`,supportTicket).pipe(map(unwrap));
  }

  getAllSupportTickets(): Observable<SupportTicket[]> {
    return this.http.get<ApiResponse<SupportTicket[]>>(`${this.endpoint}/findall`).pipe(map(unwrap));
  }

  getSupportTicket(id: number): Observable<SupportTicket> {
    return this.http.get<ApiResponse<SupportTicket>>(`${this.endpoint}/${id}`).pipe(map(unwrap));
  }

  getMyTickets(): Observable<SupportTicket[]> {
    return this.http.get<ApiResponse<SupportTicket[]>>(`${this.endpoint}/me/tickets`).pipe(map(unwrap));
  }

  // Responder cierra el ticket; el backend solo toma adminResponse.
  respondToTicket(id: number, adminResponse: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.endpoint}/${id}/respond`, { adminResponse }).pipe(map(unwrap));
  }

  deleteSupportTicket(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.endpoint}/${id}`).pipe(map(unwrap));
  }

}
