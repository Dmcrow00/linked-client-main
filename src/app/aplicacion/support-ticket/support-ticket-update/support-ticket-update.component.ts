import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { SupportTicket } from '../support-ticket.model';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';

import { SupportTicketService } from '../support-ticket.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
    selector: 'app-support-ticket-update',
    templateUrl: './support-ticket-update.component.html',
    styleUrls: ['./support-ticket-update.component.scss'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, FormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class SupportTicketUpdateComponent {
  private supportTicketService = inject(SupportTicketService);
  private dialog = inject(MatDialog);
  dialogRef = inject<MatDialogRef<SupportTicketUpdateComponent>>(MatDialogRef);
  data = inject<{
    supportTicket: SupportTicket;
}>(MAT_DIALOG_DATA);

  supportTicket: SupportTicket;

  constructor() {
    const data = this.data;

    // Inicializo el supportTicket con data del dialog
    this.supportTicket = { ...data.supportTicket };
  }

  onUpdateSupportTicket() {
    this.supportTicketService
      .updateSupportTicket(this.supportTicket.id, {
        status: this.supportTicket.status,
        category: this.supportTicket.category,
        priority: this.supportTicket.priority,
        adminResponse: this.supportTicket.adminResponse,
      })
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'Ocurrió un error';
          this.showErrorDialog(errorMessage);
        },
      });
  }

  private showErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { title: 'Error', message, type: 'error' },
      width: '400px',
    });
  }

  cancel(): void {
    this.dialogRef.close(false); // Cierra el diálogo sin guardar cambios
  }
}
