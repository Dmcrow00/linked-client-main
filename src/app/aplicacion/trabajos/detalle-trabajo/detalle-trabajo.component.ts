import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { LoginService } from 'src/app/services/auth/login.service';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { ServerUrlPipe } from '../../../pipes/server-url.pipe';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { AvisosService } from 'src/app/core/avisos.service';
@Component({
    selector: 'app-detalle-trabajo',
    templateUrl: './detalle-trabajo.component.html',
    styleUrl: './detalle-trabajo.component.scss',
    imports: [MatIcon, MatIconButton, MatDialogClose, MatDivider, DatePipe, ServerUrlPipe, NoDoubleSubmitDirective]
})
export class DetalleTrabajoComponent implements OnInit {
  dialogRef = inject<MatDialogRef<DetalleTrabajoComponent>>(MatDialogRef);
  data = inject<{
    trabajo: Trabajo;
    isLiked: boolean;
}>(MAT_DIALOG_DATA);
  private router = inject(Router);
  private trabajosService = inject(TrabajosService);
  private loginService = inject(LoginService);
  private avisos = inject(AvisosService);

  currentImageIndex = 0;

  isLiked = false;
  likesCount = 0;
  userLoginOn = false;

  ngOnInit(): void {

    this.isLiked = this.data.isLiked;
    this.likesCount = this.data.trabajo.likesCount ?? 0;

    this.loginService.userLoginOn.subscribe(logged => this.userLoginOn = logged);
  }

  // --- Navegación Carrusel ---
  nextImage() {
    if (!this.data.trabajo.fotos) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.data.trabajo.fotos.length;
  }

  prevImage() {
    if (!this.data.trabajo.fotos) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.data.trabajo.fotos.length) % this.data.trabajo.fotos.length;
  }

  // --- Acciones ---
  irAlPerfil() {
    this.dialogRef.close(); // Cerramos modal primero
    if (this.data.trabajo.tatuador) {
      this.router.navigate(['/perfil-publico', this.data.trabajo.tatuador.id]);
    }
  }

  toggleLike() {
    if (!this.userLoginOn) {
        this.avisos.info('Inicia sesión para dar Me Gusta');
        return; 
    }

    const trabajoId = this.data.trabajo.id;

    // Optimistic UI
    this.isLiked = !this.isLiked;
    this.likesCount += this.isLiked ? 1 : -1;

    if (this.isLiked) {
      this.trabajosService.darLike(trabajoId).subscribe({
        error: (err) => { this.isLiked = false; this.likesCount--; this.avisos.fallo(err, 'No se pudo guardar el Me Gusta.'); } // Revertir
      });
    } else {
      this.trabajosService.quitarLike(trabajoId).subscribe({
        error: (err) => { this.isLiked = true; this.likesCount++; this.avisos.fallo(err, 'No se pudo quitar el Me Gusta.'); } // Revertir
      });
    }
  }
}
