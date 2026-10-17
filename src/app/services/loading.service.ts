import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private pedidosEnCurso = 0;
  private showTime = 0;
  private readonly minDuration = 400;

  /** Empezó un pedido: con el primero se muestra el overlay. */
  inicio(): void {
    this.pedidosEnCurso++;
    if (this.pedidosEnCurso === 1) this.show();
  }

  /** Terminó un pedido: con el último se oculta. */
  fin(): void {
    this.pedidosEnCurso = Math.max(0, this.pedidosEnCurso - 1);
    if (this.pedidosEnCurso === 0) this.hide();
  }

  show() {
    this.showTime = Date.now();
    // Esperar al próximo "tick" para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.loadingSubject.next(true), 0);
  }

  hide() {
    const elapsed = Date.now() - this.showTime;
    const remaining = this.minDuration - elapsed;

    // Si arrancó otro pedido mientras tanto, el overlay sigue.
    setTimeout(() => {
      if (this.pedidosEnCurso === 0) this.loadingSubject.next(false);
    }, Math.max(0, remaining));
  }
}
