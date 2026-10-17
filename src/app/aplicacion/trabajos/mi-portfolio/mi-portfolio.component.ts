import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { apiErrorMessage } from '@dmcrow00/ng-core/http';

import { User } from 'src/app/models/user.model';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { UserService } from 'src/app/services/user/user.service';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { InstagramService, InstagramStatus } from 'src/app/services/instagram/instagram.service';
import { ServerUrlPipe } from 'src/app/pipes/server-url.pipe';
import { PostTileComponent } from 'src/app/components/post-tile/post-tile.component';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';
import { DetalleTrabajoComponent } from '../detalle-trabajo/detalle-trabajo.component';
import { AvisosService } from 'src/app/core/avisos.service';

@Component({
  selector: 'app-mi-portfolio',
  imports: [MatIcon, MatIconButton, ServerUrlPipe, PostTileComponent, NoDoubleSubmitDirective],
  templateUrl: './mi-portfolio.component.html',
  styleUrl: './mi-portfolio.component.scss'
})
export class MiPortfolioComponent implements OnInit {
  private avisos = inject(AvisosService);
  private userService = inject(UserService);
  private trabajosService = inject(TrabajosService);
  private instagramService = inject(InstagramService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private location = inject(Location);


  user: User | null = null;
  trabajos: Trabajo[] = [];
  instagramStatus: InstagramStatus = { connected: false };

  isLoading = true;
  instagramLoading = false;
  instagramLoadingMessage = '';
  syncMessage = '';
  syncMessageIsError = false;

  private userId: number | null = null;

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.userService.getUserId().subscribe(id => {
      if (!id) {
        this.router.navigate(['/inicio']);
        return;
      }
      this.userId = id;
      this.loadData();
      this.loadInstagramStatus();
    });
  }

  private loadData(): void {
    if (!this.userId) return;
    this.userService.getUser(this.userId).subscribe({
      next: (user) => (this.user = user),
      error: (err) => this.avisos.fallo(err, 'No se pudo cargar tu perfil.')
    });
    this.trabajosService.getTrabajosPorTatuador(this.userId).subscribe({
      next: (data) => { this.trabajos = data; this.isLoading = false; },
      error: (err) => {
        this.isLoading = false;
        this.avisos.fallo(err, 'No se pudieron cargar tus trabajos.');
      }
    });
  }

  private loadInstagramStatus(): void {
    this.instagramService.getStatus().subscribe({
      next: (status) => (this.instagramStatus = status),
      error: () => (this.instagramStatus = { connected: false })
    });
  }

  syncInstagram(): void {
    this.instagramLoading = true;
    this.instagramLoadingMessage = 'Sincronizando con Instagram...';
    this.syncMessage = '';
    this.instagramService.syncPosts().subscribe({
      next: () => {
        this.syncMessage = 'Publicaciones sincronizadas con Instagram.';
        this.syncMessageIsError = false;
        this.instagramLoading = false;
        this.loadData();
      },
      error: (err) => {
        this.syncMessage = apiErrorMessage(err, 'Error al sincronizar con Instagram.');
        this.syncMessageIsError = true;
        this.instagramLoading = false;
        this.loadInstagramStatus();
      }
    });
  }

  abrirDetalle(trabajo: Trabajo): void {
    this.dialog.open(DetalleTrabajoComponent, {
      width: '460px',
      maxWidth: '100vw',
      maxHeight: '90vh',
      panelClass: 'custom-modal-panel',
      data: { trabajo, isLiked: false }
    });
  }
}
