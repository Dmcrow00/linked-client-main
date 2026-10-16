import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Trabajo } from 'src/app/models/trabajos/trabajos.model';
import { ServerUrlPipe } from 'src/app/pipes/server-url.pipe';

@Component({
  selector: 'app-post-tile',
  imports: [MatIcon, ServerUrlPipe],
  templateUrl: './post-tile.component.html',
  styleUrl: './post-tile.component.scss'
})
export class PostTileComponent {
  @Input() trabajo!: Trabajo;
  @Input() isLiked = false;
  @Input() showArtistInfo = false; 

  @Output() toggleLike = new EventEmitter<void>();
  @Output() clickCard = new EventEmitter<void>(); // Para abrir detalle

  currentImageIndex = 0;
  hasError = false;

  nextImage(event: Event) {
    event.stopPropagation(); 
    if (this.trabajo.fotos && this.currentImageIndex < this.trabajo.fotos.length - 1) {
      this.currentImageIndex++;
      this.hasError = false; // Resetear error al cambiar
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.hasError = false;
    }
  }
}
