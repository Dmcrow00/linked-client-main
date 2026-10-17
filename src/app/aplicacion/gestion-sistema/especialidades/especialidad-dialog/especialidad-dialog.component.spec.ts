import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideDynamicForms } from '@dmcrow00/ng-core/forms';
import { of, throwError } from 'rxjs';

import { CampoMaterialComponent } from 'src/app/core/ui/campo-material/campo-material.component';
import { Especialidad } from '../especialidades.model';
import { EspecialidadesService } from '../especialidades.service';
import { EspecialidadDialogComponent, EspecialidadDialogData } from './especialidad-dialog.component';

describe('EspecialidadDialogComponent', () => {
  let service: jasmine.SpyObj<EspecialidadesService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<EspecialidadDialogComponent, boolean>>;

  function crear(data: EspecialidadDialogData) {
    service = jasmine.createSpyObj<EspecialidadesService>('EspecialidadesService', ['createEspecialidad', 'updateEspecialidad']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    TestBed.configureTestingModule({
      imports: [EspecialidadDialogComponent],
      providers: [
        provideNoopAnimations(),
        provideDynamicForms({ renderers: { default: CampoMaterialComponent } }),
        { provide: EspecialidadesService, useValue: service },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });
    const fixture = TestBed.createComponent(EspecialidadDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  function escribir(fixture: ReturnType<typeof crear>, id: string, valor: string) {
    const campo = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement;
    campo.value = valor;
    campo.dispatchEvent(new Event('input'));
  }

  function boton(fixture: ReturnType<typeof crear>, texto: string): HTMLButtonElement {
    const botones = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    return botones.find((b) => b.textContent?.trim() === texto)!;
  }

  it('alta: manda nombre y descripción y cierra avisando que guardó', async () => {
    const fixture = crear({});
    service.createEspecialidad.and.returnValue(of({ id: 9, nombre: 'Realismo', descripcion: 'Retratos', status: 'true' }));
    escribir(fixture, 'especialidad-nombre', 'Realismo');
    escribir(fixture, 'especialidad-descripcion', 'Retratos');

    boton(fixture, 'Crear').click();
    await fixture.whenStable();

    expect(service.createEspecialidad).toHaveBeenCalledWith({ nombre: 'Realismo', descripcion: 'Retratos' });
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('con campos vacíos no llama al servidor y marca los errores', async () => {
    const fixture = crear({});
    boton(fixture, 'Crear').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.createEspecialidad).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('mat-error').length).toBe(2);
  });

  it('edición: si el servidor rechaza, muestra su mensaje y no cierra', async () => {
    const especialidad: Especialidad = { id: 4, nombre: 'Blackwork', descripcion: 'Negro sólido', status: 'true' };
    const fixture = crear({ especialidad });
    service.updateEspecialidad.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 409, error: { success: false, message: 'Ya existe una especialidad con ese nombre.' },
    })));

    boton(fixture, 'Guardar').click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.updateEspecialidad).toHaveBeenCalledWith(4, { nombre: 'Blackwork', descripcion: 'Negro sólido' });
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ya existe una especialidad con ese nombre.');
  });

  it('detalle: los campos no se editan y sólo se puede cerrar', () => {
    const especialidad: Especialidad = { id: 4, nombre: 'Blackwork', descripcion: 'Negro sólido', status: 'false' };
    const fixture = crear({ especialidad, soloLectura: true });

    expect((fixture.nativeElement.querySelector('#especialidad-nombre') as HTMLInputElement).disabled).toBeTrue();
    expect(boton(fixture, 'Guardar')).toBeUndefined();
    expect(fixture.nativeElement.textContent).toContain('Estado: Inactivo');
    boton(fixture, 'Cerrar').click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
