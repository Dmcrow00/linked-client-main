import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AppComponent } from './app.component';
import { LoginService } from './services/auth/login.service';

describe('AppComponent', () => {
  const rol = new BehaviorSubject('');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LoginService,
          useValue: {
            userLoginOn: new BehaviorSubject(true),
            userRol: rol,
            userToken: '',
            isLoggedIn: () => true,
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();
  });

  it('se llama linked-client', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;
    expect(app.title).toEqual('linked-client');
  });

  it('el menú de administración se ve sólo con el rol Administrador del token', () => {
    const fixture = TestBed.createComponent(AppComponent);
    rol.next('Cliente');
    fixture.detectChanges();
    expect(fixture.componentInstance.userIsAdmin).toBeFalse();

    rol.next('Administrador');
    fixture.detectChanges();
    expect(fixture.componentInstance.userIsAdmin).toBeTrue();
  });
});
