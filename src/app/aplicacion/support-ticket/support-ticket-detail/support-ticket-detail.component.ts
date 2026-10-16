import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DynamicFormComponent, FieldConfig, buildForm, useSaveForm } from '@dmcrow00/ng-core/forms';

import { SupportTicket } from '../support-ticket.model';
import { SupportTicketService } from '../support-ticket.service';

interface Respuesta {
  adminResponse: string;
}

const CAMPOS: FieldConfig<Respuesta>[] = [
  {
    key: 'adminResponse',
    type: 'textarea',
    label: 'Respuesta al cliente',
    placeholder: 'Redactá la respuesta que recibirá el usuario por correo...',
    required: true,
    minLength: 10,
    rows: 5,
    errors: { required: 'La respuesta es requerida.' },
  },
];

/** Detalle de un ticket y su respuesta. Responder lo cierra (lo resuelve) en el servidor; cierra con true. */
@Component({
  selector: 'app-support-ticket-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support-ticket-detail.component.html',
  styleUrls: ['./support-ticket-detail.component.scss'],
  imports: [DatePipe, MatIcon, MatButton, DynamicFormComponent],
})
export class SupportTicketDetailComponent {
  private supportTicketService = inject(SupportTicketService);
  private dialogRef = inject<MatDialogRef<SupportTicketDetailComponent, boolean>>(MatDialogRef);
  protected readonly data = inject<{ supportTicket: SupportTicket }>(MAT_DIALOG_DATA);

  protected readonly campos = CAMPOS;
  protected readonly form = buildForm<Respuesta>(CAMPOS, {});
  protected readonly estado = useSaveForm({ errorMessage: 'No se pudo enviar la respuesta.' });

  async onRespond(): Promise<void> {
    if (!this.estado.validate(this.form)) return;
    await this.estado.save(
      () => this.supportTicketService.respondToTicket(this.data.supportTicket.id, this.form.getRawValue().adminResponse),
      () => this.dialogRef.close(true)
    );
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
