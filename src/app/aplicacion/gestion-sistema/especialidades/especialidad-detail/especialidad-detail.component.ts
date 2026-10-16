import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Especialidad } from '../especialidades.model';
import { MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-especialidad-detail',
    templateUrl: './especialidad-detail.component.html',
    styleUrl: './especialidad-detail.component.scss',
    imports: [MatCard, MatCardHeader, MatCardAvatar, MatIcon, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatButton]
})
export class EspecialidadDetailComponent {
  dialogRef = inject<MatDialogRef<EspecialidadDetailComponent>>(MatDialogRef);
  data = inject<{
    especialidad: Especialidad;
}>(MAT_DIALOG_DATA);


  onClose(): void {
    this.dialogRef.close();
  }
}

