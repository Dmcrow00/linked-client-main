import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

import { DetalleTrabajoComponent } from 'src/app/aplicacion/trabajos/detalle-trabajo/detalle-trabajo.component';
import { SubirTrabajoComponent } from 'src/app/aplicacion/trabajos/subir-trabajo/subir-trabajo/subir-trabajo.component';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { LoginService } from 'src/app/services/auth/login.service';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { PostTrabajoComponent } from '../../components/post-trabajo/post-trabajo.component';
import { SolicitudesTatuadorComponent } from 'src/app/aplicacion/solicitudes-tatuador/solicitudes-tatuador.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [RouterLink, MatTooltip, MatIcon, PostTrabajoComponent, SolicitudesTatuadorComponent]
})

export class HomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private loginService = inject(LoginService);
  private trabajosService = inject(TrabajosService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);


  userLoginOn: boolean = false;
  userRol: string | null = null;
  feed: Trabajo[] = [];
  misLikes: Set<number> = new Set();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loginService.userLoginOn
      .pipe(takeUntil(this.destroy$))
      .subscribe(logged => {
        this.userLoginOn = logged;
        if (logged) {
          this.cargarMisLikes();
        } else {
          this.misLikes.clear();
        }
      });

    this.loginService.userRol
      .pipe(takeUntil(this.destroy$))
      .subscribe(rol => { this.userRol = rol; });

    this.cargarFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  abrirDetalle(trabajo: Trabajo) {
    const dialogRef = this.dialog.open(DetalleTrabajoComponent, {
      panelClass: 'custom-modal-panel',
      width: '460px',
      maxWidth: '100vw',
      maxHeight: '90vh',
      data: {
        trabajo: trabajo,
        isLiked: this.misLikes.has(trabajo.id)
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      // Opcional: Recargar likes o feed al volver si hubo cambios drásticos
      // this.cargarMisLikes(); 
    });
  }

  cargarFeed() {
    this.trabajosService.getFeed().subscribe({
      next: (data) => this.feed = data,
      error: (err) => console.error('Error cargando feed', err)
    });
  }

  cargarMisLikes() {
    this.trabajosService.getMisLikesIds().subscribe({
      next: (ids) => this.misLikes = new Set(ids)
    });
  }



  onToggleLike(trabajoId: number) {
    if (!this.userLoginOn) {
      this.snackBar.open("Debes iniciar sesión para dar Me Gusta.", 'Cerrar', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }
    const trabajo = this.feed.find(t => t.id === trabajoId);
    if (!trabajo) return;

    const yaTieneLike = this.misLikes.has(trabajoId);

    if (yaTieneLike) {
      this.misLikes.delete(trabajoId);
      trabajo.likesCount--;

      this.trabajosService.quitarLike(trabajoId).subscribe({
        error: () => {
          this.misLikes.add(trabajoId);
          trabajo.likesCount++;
          console.error("Error al quitar like");
        }
      });

    } else {
      this.misLikes.add(trabajoId);
      trabajo.likesCount++;
      this.trabajosService.darLike(trabajoId).subscribe({
        error: () => {
          this.misLikes.delete(trabajoId);
          trabajo.likesCount--;
          console.error("Error al dar like");
        }
      });
    }
  }

  abrirSubirTrabajo() {
    const dialogRef = this.dialog.open(SubirTrabajoComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Si subió foto, recargamos el feed para que vea su propio post arriba
        this.cargarFeed();
      }
    });
  }
}


