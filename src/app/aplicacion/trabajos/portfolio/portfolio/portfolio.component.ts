import { Component, Input } from '@angular/core';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { LoginService } from 'src/app/services/auth/login.service';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { DetalleTrabajoComponent } from '../../detalle-trabajo/detalle-trabajo.component';
import { TatuadorService } from 'src/app/services/user/tatuador.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Tatuador } from 'src/app/models/tatuador/tatuador.model';
import { NgIf, NgFor, Location } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { ServerUrlPipe } from '../../../../pipes/server-url.pipe';
import { PostTileComponent } from 'src/app/components/post-tile/post-tile.component';
@Component({
    selector: 'app-portfolio',
    templateUrl: './portfolio.component.html',
    styleUrl: './portfolio.component.scss',
    imports: [PostTileComponent, NgIf, MatIcon, NgFor, MatButton, MatIconButton, ServerUrlPipe]
})
export class PortfolioComponent {
tatuador: Tatuador | null = null;
  trabajos: Trabajo[] = [];
  misLikes: Set<number> = new Set();
  
  isLoading = true;
  userLoginOn = false;
  esCliente = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tatuadorService: TatuadorService,
    private trabajosService: TrabajosService,
    private loginService: LoginService,
    private dialog: MatDialog,
    private location: Location
  ) {}

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
    this.tatuadorService.getTatuadores().subscribe(tatuadores => {
        this.tatuador = tatuadores.find(t => t.id === id) || null;
    });
  }

  cargarTrabajos(id: number) {
    this.trabajosService.getTrabajosPorTatuador(id).subscribe({
      next: (data) => {
        this.trabajos = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  cargarMisLikes() {
    this.trabajosService.getMisLikesIds().subscribe(ids => this.misLikes = new Set(ids));
  }

  // --- Acciones ---

  irAReservar() {
    if (this.tatuador) {
        this.router.navigate(['/reserva/horarios', this.tatuador.id]);
    }
  }

  abrirDetalle(trabajo: Trabajo) {
     const dialogRef = this.dialog.open(DetalleTrabajoComponent, {
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
            error: () => { this.misLikes.add(trabajo.id); trabajo.likesCount++; }
        });
    } else {
        this.misLikes.add(trabajo.id);
        trabajo.likesCount++;
        this.trabajosService.darLike(trabajo.id).subscribe({
            error: () => { this.misLikes.delete(trabajo.id); trabajo.likesCount--; }
        });
    }
  }

   goBack(): void {
    this.location.back(); 
  }
}
