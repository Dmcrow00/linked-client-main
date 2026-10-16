import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { SupportTicketCreateComponent } from 'src/app/aplicacion/support-ticket/support-ticket-create/support-ticket-create.component';
import { LoginService } from 'src/app/services/auth/login.service';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  const sesion = new BehaviorSubject(false);
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LoginService, useValue: { userLoginOn: sesion } },
        { provide: MatDialog, useValue: dialog },
      ],
    });
  });

  it('sin sesión, "Soporte" abre el alta de ticket', () => {
    sesion.next(false);
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
    fixture.componentInstance.handleSoporte();
    expect(dialog.open).toHaveBeenCalledWith(SupportTicketCreateComponent, jasmine.any(Object));
  });

  it('con sesión, "Soporte" lleva a la pantalla de tickets', () => {
    sesion.next(true);
    const fixture = TestBed.createComponent(FooterComponent);
    const navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    fixture.componentInstance.handleSoporte();
    expect(navegar).toHaveBeenCalledWith(['/soporte']);
    expect(dialog.open).not.toHaveBeenCalled();
  });
});
