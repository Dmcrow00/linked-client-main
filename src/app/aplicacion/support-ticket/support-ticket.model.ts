export class SupportTicket {
  id: number = 0;
  // Indica si el ticket sigue abierto.
  status: boolean = false;
  description: string | null = null;
  category?: string | null = null;
  priority?: string | null = null;
  urlPagina?: string | null = null;
  userAgent?: string | null = null;
  screenshot?: string | null = null;
  adminResponse?: string | null = null;
  contactEmail?: string | null = null;
  usuarios?: string[];
  creationTimestamp?: string | null = null;
  modificationTimestamp?: string | null = null;
}

// El alta sólo acepta estos campos; el resto lo completa el backend.
export interface SupportTicketCreatePayload {
  description: string | null;
  category?: string | null;
  priority?: string | null;
  urlPagina?: string | null;
  userAgent?: string | null;
  screenshot?: string | null;
  contactEmail?: string | null;
}

// Actualización parcial: los campos ausentes no se modifican.
export interface SupportTicketUpdatePayload {
  status?: boolean;
  category?: string | null;
  priority?: string | null;
  adminResponse?: string | null;
}
