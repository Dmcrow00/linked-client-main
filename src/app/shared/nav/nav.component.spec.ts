import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { LoginService } from 'src/app/services/auth/login.service';
import { ProximamenteService } from 'src/app/services/proximamente.service';
import { UserService } from 'src/app/services/user/user.service';
import { NavComponent } from './nav.component';

class MockLoginService {
  userLoginOn = of(true);
  userRol = of('Tatuador');
  logout = jasmine.createSpy('logout');
}

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: LoginService, useClass: MockLoginService },
        { provide: UserService, useValue: { getLoggedInUsername: () => of('UsuarioTest') } },
        { provide: ProximamenteService, useValue: { mostrarMensaje: jasmine.createSpy('mostrarMensaje') } },
      ],
    });

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('con sesión, toma el nombre y el rol del usuario', () => {
    expect(component.userLoginOn).toBeTrue();
    expect(component.username).toBe('UsuarioTest');
    expect(component.userRol).toBe('Tatuador');
  });

  it('abre y cierra el menú', () => {
    expect(component.menuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });
});
