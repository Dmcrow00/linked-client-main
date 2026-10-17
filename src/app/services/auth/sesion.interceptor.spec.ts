import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AvisosService } from 'src/app/core/avisos.service';
import { LoginService } from './login.service';
import { sesionInterceptor } from './sesion.interceptor';

describe('sesionInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let login: { userToken: string; logout: jasmine.Spy };
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let avisos: jasmine.SpyObj<AvisosService>;

  beforeEach(() => {
    login = { userToken: 'token-de-prueba', logout: jasmine.createSpy('logout') };
    router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/mis-reservas' });
    router.navigate.and.resolveTo(true);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['closeAll']);
    avisos = jasmine.createSpyObj<AvisosService>('AvisosService', ['info']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sesionInterceptor])),
        provideHttpClientTesting(),
        { provide: LoginService, useValue: login },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: AvisosService, useValue: avisos },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('manda el token al backend propio', () => {
    http.get(`${environment.urlApi}especialidades`).subscribe();
    const req = backend.expectOne(`${environment.urlApi}especialidades`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    req.flush({ success: true, data: [] });
  });

  it('no manda el token a servicios externos', () => {
    http.get('https://nominatim.openstreetmap.org/search?q=cordoba').subscribe();
    const req = backend.expectOne((r) => r.url.startsWith('https://nominatim.openstreetmap.org'));
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('con la sesión vencida (401) la cierra y lleva al login para volver después', async () => {
    const pedido = firstValueFrom(http.get(`${environment.urlApi}turnos/mis-reservas-cliente`));
    backend.expectOne(`${environment.urlApi}turnos/mis-reservas-cliente`).flush(null, { status: 401, statusText: 'Unauthorized' });
    await expectAsync(pedido).toBeRejected();
    expect(login.logout).toHaveBeenCalled();
    expect(dialog.closeAll).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/mis-reservas' } });
    expect(avisos.info).toHaveBeenCalled();
  });

  it('un 403 no cierra la sesión: la pantalla muestra el motivo', async () => {
    const pedido = firstValueFrom(http.post(`${environment.urlApi}turnos/gestionar/3`, {}));
    backend.expectOne(`${environment.urlApi}turnos/gestionar/3`).flush({ message: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });
    await expectAsync(pedido).toBeRejected();
    expect(login.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
