import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';

import { SupportTicket } from '../support-ticket.model';
import { SupportTicketService } from '../support-ticket.service';
import { UserService } from 'src/app/services/user/user.service';
import { ErrorDialogComponent } from 'src/app/components/error-dialog/error-dialog.component';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
  selector: 'app-support-ticket-detail',
  templateUrl: './support-ticket-detail.component.html',
  styleUrls: ['./support-ticket-detail.component.scss'],
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatIcon,
    MatButton,
    MatFormField,
    MatError,
    MatSelect,
    MatOption,
    MatInput,
    NoDoubleSubmitDirective
],
})
export class SupportTicketDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supportTicketService = inject(SupportTicketService);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  dialogRef = inject<MatDialogRef<SupportTicketDetailComponent>>(MatDialogRef);
  data = inject<{
    supportTicket: SupportTicket;
}>(MAT_DIALOG_DATA);

  gestionForm: FormGroup;
  saving = false;

  constructor() {
    const data = this.data;

    this.gestionForm = this.fb.group({
      status: [data.supportTicket.status + '' === 'true'],
      adminResponse: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {}

  onRespond(): void {
    if (this.gestionForm.invalid) return;
    this.saving = true;

    this.supportTicketService
      .respondToTicket(this.data.supportTicket.id, this.gestionForm.value.adminResponse)
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving = false;
          const msg = err?.error?.message || 'Error al enviar la respuesta';
          this.dialog.open(ErrorDialogComponent, {
            data: { type: 'error', message: msg },
          });
        },
      });
  }

  onClose(): void {
    this.dialogRef.close(false);
  }
}
