import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { ErrorDialogComponent } from '../../../components/error-dialog/error-dialog.component';
import { SupportTicketService } from '../support-ticket.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
    selector: 'app-support-ticket-delete',
    templateUrl: './support-ticket-delete.component.html',
    styleUrls: ['./support-ticket-delete.component.scss'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatIcon, MatCardContent, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class SupportTicketDeleteComponent implements OnInit {
  private supportTicketService = inject(SupportTicketService);
  private dialog = inject(MatDialog);
  private dialogRef = inject<MatDialogRef<SupportTicketDeleteComponent>>(MatDialogRef);
  data = inject<{
    id: number;
}>(MAT_DIALOG_DATA);

  supportTicketName: number = 0;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.supportTicketService.getSupportTicket(this.data.id).subscribe({
      next: (supportTicket) => {
        this.supportTicketName = supportTicket.id;
      },
      error: () => {
      },
    });
  }

  deleteSupportTicket(): void {
    this.supportTicketService.deleteSupportTicket(this.data.id).subscribe({
      next: () => {
        this.successMessage = 'supportTicket eliminado satisfactoriamente';
        this.dialogRef.close(true);
      },
      error: (error) => {
        const errorMessage = error?.error?.msg || 'Ocurrió un error';
        this.showErrorDialog(errorMessage);
      },
    });
  }

  private showErrorDialog(errorMessage: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { message: errorMessage, type: 'error' },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
