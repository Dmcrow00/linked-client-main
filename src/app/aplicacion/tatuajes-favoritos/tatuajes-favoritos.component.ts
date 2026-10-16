import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { TrabajosService } from 'src/app/services/trabajos/trabajos.service';
import { PostTrabajoComponent } from 'src/app/components/post-trabajo/post-trabajo.component';
import { DetalleTrabajoComponent } from '../trabajos/detalle-trabajo/detalle-trabajo.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-tatuajes-favoritos',
  imports: [PostTrabajoComponent, MatIcon, MatIconButton],
  templateUrl: './tatuajes-favoritos.component.html',
  styleUrl: './tatuajes-favoritos.component.scss'
})
export class TatuajesFavoritosComponent implements OnInit {
  private trabajosService = inject(TrabajosService);
  private dialog = inject(MatDialog);
  private location = inject(Location);


  trabajosFavoritos: Trabajo[] = [];
  favorites = new Set<number>();
  isLoading = true;

  get uniqueArtistsCount(): number {
    const ids = this.trabajosFavoritos
      .map(t => t.tatuador?.id)
      .filter((id): id is number => id !== undefined);
    return new Set(ids).size;
  }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.cargarMisLikes();
  }

  cargarMisLikes(): void {
    this.isLoading = true;
    this.trabajosService.getMisLikesIds().subscribe({
      next: (ids) => {
        this.favorites = new Set(ids);
        const idArray = Array.from(ids);

        if (idArray.length === 0) {
          this.isLoading = false;
          return;
        }

        let loaded = 0;
        idArray.forEach(id => {
          this.trabajosService.getTrabajoById(id).subscribe({
            next: (trabajo) => {
              if (!this.trabajosFavoritos.some(t => t.id === trabajo.id)) {
                this.trabajosFavoritos.push(trabajo);
              }
              loaded++;
              if (loaded === idArray.length) this.isLoading = false;
            },
            error: () => {
              loaded++;
              if (loaded === idArray.length) this.isLoading = false;
            }
          });
        });
      },
      error: () => { this.isLoading = false; }
    });
  }

  onToggleLike(trabajoId: number): void {
    const trabajo = this.trabajosFavoritos.find(t => t.id === trabajoId);
    if (!trabajo) return;

    if (this.favorites.has(trabajoId)) {
      this.favorites.delete(trabajoId);
      this.trabajosFavoritos = this.trabajosFavoritos.filter(t => t.id !== trabajoId);

      this.trabajosService.quitarLike(trabajoId).subscribe({
        error: () => {
          this.favorites.add(trabajoId);
          this.trabajosFavoritos.push(trabajo);
        }
      });
    } else {
      this.favorites.add(trabajoId);
      trabajo.likesCount++;
      this.trabajosService.darLike(trabajoId).subscribe({
        error: () => {
          this.favorites.delete(trabajoId);
          trabajo.likesCount--;
        }
      });
    }
  }

  abrirDetalle(trabajo: Trabajo): void {
    this.dialog.open(DetalleTrabajoComponent, {
      panelClass: 'custom-modal-panel',
      width: '460px',
      maxWidth: '100vw',
      maxHeight: '90vh',
      data: { trabajo, isLiked: this.favorites.has(trabajo.id) }
    });
  }
}
