import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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

@Component({
    selector: 'app-subir-trabajo',
    templateUrl: './subir-trabajo.component.html',
    styleUrl: './subir-trabajo.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatTooltip, MatIcon, MatFormField, MatLabel, MatInput, FormsModule, MatHint, MatDialogActions, MatButton, MatProgressSpinner, NoDoubleSubmitDirective]
})
export class SubirTrabajoComponent {
  private dialogRef = inject<MatDialogRef<SubirTrabajoComponent>>(MatDialogRef);
  private trabajosService = inject(TrabajosService);
  private snackBar = inject(MatSnackBar);

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  descripcion: string = '';
  isUploading = false;
  maxFiles = 5;

onFileSelected(event: any): void {
    const files = event.target.files;
    
    if (files) {
      // Validar cantidad total
      if (this.selectedFiles.length + files.length > this.maxFiles) {
        alert(`Solo puedes subir hasta ${this.maxFiles} fotos por publicación.`);
        return;
      }

      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
           continue; 
        }

        this.selectedFiles.push(file);

        // Generar preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
    // Limpiar input para permitir seleccionar más
    event.target.value = null;
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
      next: (res) => {
        this.snackBar.open('¡Trabajo publicado con éxito!', 'Genial', { duration: 3000 });
        this.dialogRef.close(true); 
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al subir las imágenes. Intenta de nuevo.', 'Cerrar', { duration: 5000 });
        this.isUploading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
