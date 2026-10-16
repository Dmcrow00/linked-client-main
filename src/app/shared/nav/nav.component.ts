import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { LoginService } from '../../services/auth/login.service';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProximamenteService } from 'src/app/services/proximamente.service';
import { HelpDialogComponent } from 'src/app/components/help-dialog/help-dialog.component';
import { SupportTicketCreateComponent } from 'src/app/aplicacion/support-ticket/support-ticket-create/support-ticket-create.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user/user.service';

import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    imports: [RouterLink, MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, ThemeToggleComponent]
})
export class NavComponent implements OnInit, OnDestroy {
  private loginService = inject(LoginService);
  private userService = inject(UserService);
  private router = inject(Router);
  private proximamenteService = inject(ProximamenteService);
  private dialog = inject(MatDialog);

  searchTerm: string = '';
  userLoginOn: boolean = false;
  username: string | null = null;
  userRol: string | null = null;
  currentUrl: string = '';
  private subscriptions: Subscription = new Subscription();

  menuOpen: boolean = false; // Estado inicial cerrado

  toggleMenu() {
    this.menuOpen = !this.menuOpen; // Cambia el estado
  }

  get isHomePage(): boolean {
    return this.currentUrl === '/inicio' || this.currentUrl === '/';
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.subscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.urlAfterRedirects;
        }
      })
    );

    this.subscriptions.add(
      this.loginService.userLoginOn.subscribe({
        next: (userLoginOn) => {
          this.userLoginOn = userLoginOn;
          if (userLoginOn) {
            this.loadUsername();
            this.loadUserRol();
          } else {
            this.username = null;
            this.userRol = null;
          }
        },
        error: (err) => {
          console.error('Error al suscribirse al estado de login', err);
        },
      })
    );
  }

  ngOnDestroy(): void {
    // Limpiar la suscripción para evitar fugas de memoria
    this.subscriptions.unsubscribe();
  }

  showProximamente(): void {
    this.proximamenteService.mostrarMensaje();
  }

  // Método para cargar el nombre del usuario
  private loadUsername(): void {
    this.subscriptions.add(
      this.userService.getLoggedInUsername().subscribe({
        next: (username) => {
          if (username != undefined) {
            this.username = username
          };
        },
        error: (err) => {
          console.error('Error al obtener el nombre de usuario', err);
        },
      })
    );
  }

  // Método para cargar el rol del usuario
  loadUserRol(): void {
    this.subscriptions.add(
      this.loginService.userRol.subscribe({
        next: (role) => {
          this.userRol = role; // Asigna el rol
        },
        error: (err) => {
          console.error('Error al obtener el rol del usuario', err);
        },
      })
    );
  }

  dashboard() {
    this.router.navigate(['/dashboard']);
  }

  login() {
    this.router.navigate(['/login']);
  }

  register() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/inicio']);
    window.location.reload();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/resultados'], {
        queryParams: { param: this.searchTerm },
      });
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.router.navigate(['/']); // vuelve al inicio
  }

  openHelp(): void {
    this.dialog.open(SupportTicketCreateComponent, {
      width: '620px',
      maxWidth: '95vw',
      disableClose: true,
    });
  }
}
