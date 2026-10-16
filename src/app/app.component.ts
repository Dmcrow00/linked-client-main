import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LoginService } from './services/auth/login.service';
import { LoadingService } from './services/loading.service';
import { ThemeService } from './core/services/theme.service';
import { UserService } from './services/user/user.service';
import { RolApl } from './models/rol.models';
import { AsyncPipe } from '@angular/common';
import { HeaderComponent } from './shared/header/header.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { SweItemMenuComponent } from './components/sweitemmenu/sweitemmenu.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [HeaderComponent, MatIconButton, RouterLink, MatIcon, ThemeToggleComponent, SweItemMenuComponent, LoadingOverlayComponent, RouterOutlet, FooterComponent, AsyncPipe]
})
export class AppComponent implements OnInit, OnDestroy {
  private loginService = inject(LoginService);
  private themeService = inject(ThemeService);
  private loadingService = inject(LoadingService);
  private userService = inject(UserService);
  private router = inject(Router);

  title = 'linked-client';
  isLoading$: Observable<boolean>;

  userLoginOn: boolean = false;
  userIsAdmin: boolean = false;
  userId: number | null = null;
  showShell: boolean = true;

  private authSub?: Subscription;
  private routeSub?: Subscription;

  private readonly AUTH_ROUTES = ['/login', '/register', '/forgotPass', '/reset-password'];

  constructor() {
    this.isLoading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    this.routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      this.showShell = !this.AUTH_ROUTES.some(r => url.startsWith(r));
    });

    this.authSub = this.loginService.userLoginOn.subscribe(async (isLoggedIn) => {
      this.userLoginOn = isLoggedIn;

      if (isLoggedIn) {
        await this.checkIfAdmin();
      } else {
        this.userIsAdmin = false;
        this.userId = null;
      }
    });
  }

  async checkIfAdmin(): Promise<void> {
    try {
      this.userId = await firstValueFrom(this.userService.getUserId());
      if (!this.userId) return;

      const roles = await firstValueFrom(this.userService.getAllUserRoles(this.userId));

      if (roles) {
        for (const idRol of roles) {
          const rol: RolApl = await firstValueFrom(this.userService.getUserRolByidRole(idRol.toString()));

          if (rol.description === 'Administrador') {
            this.userIsAdmin = true;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar los roles del usuario:', error);
    }
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}