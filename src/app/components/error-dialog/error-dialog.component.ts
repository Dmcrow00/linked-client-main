import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-error-dialog',
    templateUrl: './error-dialog.component.html',
    styleUrls: ['./error-dialog.component.scss'],
    imports: [CdkScrollable, MatDialogContent, NgClass, MatIcon, MatDialogActions, MatButton]
})
export class ErrorDialogComponent {
  dialogRef = inject<MatDialogRef<ErrorDialogComponent>>(MatDialogRef);
  data = inject<{
    title: string;
    message: string;
    type: 'success' | 'error';
}>(MAT_DIALOG_DATA);


  onClose(): void {
    this.dialogRef.close();
  }
}
