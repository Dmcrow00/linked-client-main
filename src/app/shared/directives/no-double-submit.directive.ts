import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
  selector: 'button[appNoDoubleSubmit]',
  standalone: true
})
export class NoDoubleSubmitDirective {
  private el = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  @Input() submitDelay = 1500;
  private pending = false;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.pending) {
      // El click ya fue procesado: bloquear todos los listeners posteriores
      event.stopImmediatePropagation();
      return;
    }
    this.pending = true;
    // Diferir el disabled al siguiente tick para no bloquear el submit del formulario
    setTimeout(() => {
      this.el.nativeElement.disabled = true;
      setTimeout(() => {
        this.pending = false;
        this.el.nativeElement.disabled = false;
      }, this.submitDelay);
    }, 0);
  }
}
