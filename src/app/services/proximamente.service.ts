import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ProximamenteService {
  private snackBar = inject(MatSnackBar);


  mostrarMensaje(): void {
    this.snackBar.open('¡Próximamente disponible!', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
