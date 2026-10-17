import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiError } from '@dmcrow00/ng-core/http';

import { AvisosService } from './avisos.service';

describe('AvisosService', () => {
  let avisos: AvisosService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    TestBed.configureTestingModule({ providers: [{ provide: MatSnackBar, useValue: snackBar }] });
    avisos = TestBed.inject(AvisosService);
  });

  it('un error del servidor se muestra con su mensaje', () => {
    const err = new HttpErrorResponse({ status: 409, error: { success: false, message: 'El turno ya está cerrado.' } });
    avisos.fallo(err, 'No se pudo actualizar el turno.');
    expect(snackBar.open).toHaveBeenCalledWith('El turno ya está cerrado.', 'Cerrar', jasmine.any(Object));
  });

  it('si el servidor no mandó mensaje, usa el de la pantalla', () => {
    avisos.fallo(new HttpErrorResponse({ status: 404, error: null }), 'No se encontró el ticket.');
    expect(snackBar.open).toHaveBeenCalledWith('No se encontró el ticket.', 'Cerrar', jasmine.any(Object));
  });

  it('una respuesta con success: false también muestra su mensaje', () => {
    avisos.fallo(new ApiError('Sin permiso'), 'No se pudo guardar.');
    expect(snackBar.open).toHaveBeenCalledWith('Sin permiso', 'Cerrar', jasmine.any(Object));
  });

  it('un 401 no se avisa dos veces: lo avisa el interceptor de sesión', () => {
    avisos.fallo(new HttpErrorResponse({ status: 401 }), 'No se pudo cargar.');
    expect(snackBar.open).not.toHaveBeenCalled();
  });
});
