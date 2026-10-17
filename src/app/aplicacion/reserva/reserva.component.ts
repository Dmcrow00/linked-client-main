import { Component,     inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-reserva',
    templateUrl: './reserva.component.html',
    styleUrl: './reserva.component.scss',
    imports: [RouterOutlet]
})
export class ReservaComponent{
  private router = inject(Router);


  iniciarReserva(): void {
    this.router.navigate(['/reserva/listado']);
  }

  irAMisReservas(): void {
    this.router.navigate(['/mis-reservas']);
  }
  }

