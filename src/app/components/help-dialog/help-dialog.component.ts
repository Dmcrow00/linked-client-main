import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-help-dialog',
    templateUrl: './help-dialog.component.html',
    styleUrls: ['./help-dialog.component.scss'],
    imports: [CdkScrollable, MatDialogContent, MatCard, MatCardHeader, MatCardAvatar, MatIcon, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatButton]
})
export class HelpDialogComponent {
  dialogRef = inject<MatDialogRef<HelpDialogComponent>>(MatDialogRef);


  onClose(): void {
    this.dialogRef.close();
  }

}
