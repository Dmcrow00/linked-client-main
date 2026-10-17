import { Component,  inject, OnInit } from '@angular/core';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { LoginService } from 'src/app/services/auth/login.service';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { DetalleTrabajoComponent } from '../../detalle-trabajo/detalle-trabajo.component';
import { TatuadorService } from 'src/app/services/user/tatuador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Tatuador } from 'src/app/models/tatuador/tatuador.model';
import { Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ServerUrlPipe } from '../../../../pipes/server-url.pipe';
import { PostTileComponent } from 'src/app/components/post-tile/post-tile.component';
import { AvisosService } from 'src/app/core/avisos.service';
@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrl: './portfolio.component.scss',
    imports: [PostTileComponent, MatIcon, MatButton, MatIconButton, ServerUrlPipe]
})
export class PortfolioComponent implements OnInit {
  private avisos = inject(AvisosService);
private route = inject(ActivatedRoute);
private router = inject(Router);
private tatuadorService = inject(TatuadorService);
private trabajosService = inject(TrabajosService);
private loginService = inject(LoginService);
private dialog = inject(MatDialog);
private location = inject(Location);

tatuador: Tatuador | null = null;
  trabajos: Trabajo[] = [];
  misLikes = new Set<number>();
  
  isLoading = true;
  userLoginOn = false;
  esCliente = false;

  ngOnInit(): void {
    // Obtener ID de la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    const tatuadorId = Number(id);

    // Cargar Datos
    this.cargarPerfil(tatuadorId);
    this.cargarTrabajos(tatuadorId);
    
    // Verificar Login para los Likes
    this.loginService.userLoginOn.subscribe(logged => {
      this.userLoginOn = logged;
      if (logged) this.cargarMisLikes();
    });
    
    this.loginService.userRol.subscribe(rol => {
        this.esCliente = rol === 'Cliente';
    });
  }

  cargarPerfil(id: number) {
    this.tatuadorService.getPerfilPublico(id).subscribe({
      next: (tatuador) => this.tatuador = tatuador,
      error: () => this.tatuador = null
    });
  }

  cargarTrabajos(id: number) {
    this.trabajosService.getTrabajosPorTatuador(id).subscribe({
      next: (data) => {
        this.trabajos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.avisos.fallo(err, 'No se pudieron cargar los trabajos.');
      }
    });
  }

  cargarMisLikes() {
    // Sin los Me Gusta propios los trabajos se ven igual, sólo sin marcar.
    this.trabajosService.getMisLikesIds().subscribe({ next: ids => this.misLikes = new Set(ids), error: () => this.misLikes.clear() });
  }

  // --- Acciones ---

  irAReservar() {
    if (this.tatuador) {
        this.router.navigate(['/reserva/horarios', this.tatuador.id]);
    }
  }

  abrirDetalle(trabajo: Trabajo) {
     this.dialog.open(DetalleTrabajoComponent, {
      width: '460px',
      maxWidth: '100vw',
      maxHeight: '90vh',
      panelClass: 'custom-modal-panel',
      data: {
          trabajo: trabajo,
          isLiked: this.misLikes.has(trabajo.id)
      }
    });
  }

  toggleLike(trabajo: Trabajo) {
    if (!this.userLoginOn || !this.esCliente) return;
    
    const yaTieneLike = this.misLikes.has(trabajo.id);

    if (yaTieneLike) {
        this.misLikes.delete(trabajo.id);
        trabajo.likesCount--;
        this.trabajosService.quitarLike(trabajo.id).subscribe({
            error: (err) => { this.misLikes.add(trabajo.id); trabajo.likesCount++; this.avisos.fallo(err, 'No se pudo quitar el Me Gusta.'); }
        });
    } else {
        this.misLikes.add(trabajo.id);
        trabajo.likesCount++;
        this.trabajosService.darLike(trabajo.id).subscribe({
            error: (err) => { this.misLikes.delete(trabajo.id); trabajo.likesCount--; this.avisos.fallo(err, 'No se pudo guardar el Me Gusta.'); }
        });
    }
  }

   goBack(): void {
    this.location.back(); 
  }
}
