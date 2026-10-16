import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { SlicePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { ServerUrlPipe } from '../../pipes/server-url.pipe';
@Component({
    selector: 'app-post-trabajo',
    templateUrl: './post-trabajo.component.html',
    styleUrl: './post-trabajo.component.scss',
    imports: [MatIcon, MatIconButton, SlicePipe, ServerUrlPipe]
})
export class PostTrabajoComponent {
  private router = inject(Router);

  @Input() trabajo!: Trabajo;
  @Input() isLiked: boolean = false;
  @Input() showArtistInfo: boolean = true; // True en Home, False en Perfil del Tatuador
  
  @Output() toggleLike = new EventEmitter<number>(); 

  currentImageIndex: number = 0;
  hasError = false;

  nextImage(event: MouseEvent) {
    event.stopPropagation(); 
    if (!this.trabajo.fotos) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.trabajo.fotos.length;
    this.hasError = false;
  }

  prevImage(event: MouseEvent) {
    event.stopPropagation();
    if (!this.trabajo.fotos) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.trabajo.fotos.length) % this.trabajo.fotos.length;
    this.hasError = false;
  }

  onLike(event: MouseEvent) {
    event.stopPropagation(); 
    this.toggleLike.emit(this.trabajo.id);
  }


  irAlPerfil(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (this.trabajo.tatuador) {
      this.router.navigate(['/perfil-publico', this.trabajo.tatuador.id]);
    }
  }
}
