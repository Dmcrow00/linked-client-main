import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { AuthState, provideAuthRoutes } from '@dmcrow00/ng-core/auth';
import { provideDynamicForms } from '@dmcrow00/ng-core/forms';
import { Notifier } from '@dmcrow00/ng-core/ui';
import { provideTheme } from '@dmcrow00/ng-core/theme';

import { routes } from './app.routes';
import { loadingInterceptor } from './components/loading.interceptor';
import { CUSTOM_DATE_FORMATS, CustomDateAdapter } from './components/custom-date-adapter/custom-date-adapter';
import { AvisosService } from './core/avisos.service';
import { CampoMaterialComponent } from './core/ui/campo-material/campo-material.component';
import { LoginService } from './services/auth/login.service';
import { sesionInterceptor } from './services/auth/sesion.interceptor';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([sesionInterceptor, loadingInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },

    // Piezas de @dmcrow00/ng-core con el diseño y la sesión de linked.
    { provide: Notifier, useExisting: AvisosService },
    { provide: AuthState, useExisting: LoginService },
    provideAuthRoutes({ loginUrl: '/login', homeUrl: '/inicio' }),
    provideDynamicForms({ renderers: { default: CampoMaterialComponent }, formClass: 'row', fieldClass: 'col-12' }),
    provideTheme({ storageKey: 'app-theme', mode: 'class', classes: { light: 'light-theme', dark: 'dark-theme' } }),
  ],
};
