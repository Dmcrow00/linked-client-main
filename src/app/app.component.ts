import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '@dmcrow00/ng-core/theme';
import { LoginService } from './services/auth/login.service';
import { LoadingService } from './services/loading.service';
import { AsyncPipe } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { SweItemMenuComponent } from './components/sweitemmenu/sweitemmenu.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ConfirmacionComponent } from './core/ui/confirmacion/confirmacion.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [HeaderComponent, MatIconButton, RouterLink, MatIcon, ThemeToggleComponent, SweItemMenuComponent, LoadingOverlayComponent, RouterOutlet, FooterComponent, ConfirmacionComponent, AsyncPipe]
})
export class AppComponent implements OnInit {
  private loginService = inject(LoginService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  title = 'linked-client';
  isLoading$: Observable<boolean> = this.loadingService.loading$;

  userLoginOn = false;
  userIsAdmin = false;
  showShell = true;

  private readonly AUTH_ROUTES = ['/login', '/register', '/forgotPass', '/reset-password'];

  constructor() {
    // Aplica el tema guardado desde el arranque, aunque todavía no se vea el botón.
    inject(ThemeService);
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      this.showShell = !this.AUTH_ROUTES.some(r => url.startsWith(r));
    });

    this.loginService.userLoginOn
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLoggedIn) => (this.userLoginOn = isLoggedIn));

    // El rol viene en el token, como en los guards: no hace falta pedir los roles al servidor.
    this.loginService.userRol
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rol) => (this.userIsAdmin = rol === 'Administrador'));
  }
}
