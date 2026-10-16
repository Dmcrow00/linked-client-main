import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from '@dmcrow00/ng-core/ui';
import { Subject } from 'rxjs';

import { ConfirmacionComponent } from './confirmacion.component';
import { ConfirmacionDialogComponent } from './confirmacion-dialog.component';

describe('ConfirmacionComponent', () => {
  let cerrado: Subject<boolean | undefined>;
  let dialog: { open: jasmine.Spy };
  let fixture: ComponentFixture<ConfirmacionComponent>;

  beforeEach(() => {
    cerrado = new Subject();
    dialog = { open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => cerrado, close: () => undefined })) };
    TestBed.configureTestingModule({
      imports: [ConfirmacionComponent],
      providers: [{ provide: MatDialog, useValue: dialog }],
    });
    fixture = TestBed.createComponent(ConfirmacionComponent);
    fixture.detectChanges();
  });

  it('muestra la pregunta en un diálogo y devuelve la respuesta', async () => {
    const confirm = TestBed.inject(ConfirmService);
    const respuesta = confirm.ask({ title: 'Eliminar ticket', message: '¿Eliminar el ticket #3?', danger: true });
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(ConfirmacionDialogComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ title: 'Eliminar ticket', danger: true }),
    }));
    cerrado.next(true);
    expect(await respuesta).toBeTrue();
  });

  it('cerrar sin confirmar es un "no"', async () => {
    const respuesta = TestBed.inject(ConfirmService).ask({ title: 'Rechazar turno', message: '¿Rechazar?' });
    fixture.detectChanges();
    cerrado.next(undefined);
    expect(await respuesta).toBeFalse();
  });
});
