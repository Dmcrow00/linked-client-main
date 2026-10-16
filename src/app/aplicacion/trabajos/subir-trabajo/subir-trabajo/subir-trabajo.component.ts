import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { CdkScrollable } from '@angular/cdk/scrolling';

import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AvisosService } from 'src/app/core/avisos.service';

@Component({
    selector: 'app-subir-trabajo',
    templateUrl: './subir-trabajo.component.html',
    styleUrl: './subir-trabajo.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatTooltip, MatIcon, MatFormField, MatLabel, MatInput, FormsModule, MatHint, MatDialogActions, MatButton, MatProgressSpinner, NoDoubleSubmitDirective]
})
export class SubirTrabajoComponent {
  private dialogRef = inject<MatDialogRef<SubirTrabajoComponent>>(MatDialogRef);
  private trabajosService = inject(TrabajosService);
  private avisos = inject(AvisosService);

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  descripcion = '';
  isUploading = false;
  maxFiles = 5;

onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (this.selectedFiles.length + files.length > this.maxFiles) {
      this.avisos.error(`Solo puedes subir hasta ${this.maxFiles} fotos por publicación.`);
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result as string);
      reader.readAsDataURL(file);
    }
    // Limpiar input para permitir seleccionar más
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  subir(): void {
    if (this.selectedFiles.length === 0) return;

    this.isUploading = true;
    
    // 👇 CAMBIO: Pasar el array 'this.selectedFiles'
    this.trabajosService.subirTrabajo(this.descripcion, this.selectedFiles).subscribe({
      next: (_res) => {
        this.avisos.success('¡Trabajo publicado con éxito!');
        this.dialogRef.close(true); 
      },
      error: (err) => {
        this.avisos.fallo(err, 'Error al subir las imágenes. Intenta de nuevo.');
        this.isUploading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
