import { Component, Inject, OnInit } from '@angular/core';
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
  constructor(
    public dialogRef: MatDialogRef<EspecialidadDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { especialidad: Especialidad }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}

