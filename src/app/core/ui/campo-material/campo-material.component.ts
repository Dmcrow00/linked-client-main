import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { AnyFieldConfig, fieldError, fieldOptions, showFieldError } from '@dmcrow00/ng-core/forms';
import { switchMap } from 'rxjs';

/**
 * Cómo se ve un campo de `dmc-dynamic-form` en linked: un `mat-form-field` outline con la etiqueta, el control del
 * tipo (texto, correo, número, área de texto o select), la ayuda y el motivo del error. Se registra en
 * `app.config.ts` como renderizador por defecto.
 */
@Component({
  selector: 'app-campo-material',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatError, MatHint],
  templateUrl: './campo-material.component.html',
  styles: '.campo-material { width: 100%; }',
  host: { '[class]': 'layoutClass()' },
})
export class CampoMaterialComponent {
  readonly field = input.required<AnyFieldConfig>();
  readonly control = input.required<FormControl>();
  readonly inputId = input.required<string>();
  readonly submitted = input(false);
  readonly layoutClass = input('');

  /** Cambios de valor, validez y "tocado" del control, para recalcular el error con OnPush. */
  private readonly estado = toSignal(toObservable(this.control).pipe(switchMap((c) => c.events)), { initialValue: null });

  protected readonly error = computed(() => {
    this.estado();
    const control = this.control();
    return showFieldError(control, this.submitted()) ? fieldError(this.field(), control) : null;
  });

  protected readonly opciones = computed(() => fieldOptions(this.field()));

  protected readonly tipoTexto = computed(() => {
    const tipo = this.field().type;
    return tipo === 'email' || tipo === 'tel' || tipo === 'password' || tipo === 'number' ? tipo : 'text';
  });
}
