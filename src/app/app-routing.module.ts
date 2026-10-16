import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { adminGuard } from './guards/admin.guard';
import { NotAuthorizedComponent } from './components/not-authorized/not-authorized.component';

import { LoginComponent } from './auth/login/login.component';

import { AppComponent } from './app.component';

import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { PersonalDetailsComponent } from './pages/personal-details/personal-details.component';
import { SoporteComponent } from './aplicacion/support-ticket/soporte/soporte.component';
import { SupportTicketComponent } from './aplicacion/support-ticket/support-ticket.component';
import { ForgotPassComponent } from './auth/forgotPass/forgotPass.component';
import { ResetPassComponent } from './auth/resetPass/resetPass.component';
import { UsuariosComponent } from './aplicacion/usuarios/usuarios.component';
import { adminModGuard } from './guards/admin-mod.guard';
import { EspecialidadesComponent } from './aplicacion/gestion-sistema/especialidades/especialidades.component';
import { MisReservasComponent } from './aplicacion/mis-reservas/mis-reservas.component';
import { AgendaComponent } from './aplicacion/agenda/agenda.component';
import { PortfolioComponent } from './aplicacion/trabajos/portfolio/portfolio/portfolio.component';
import { TatuajesFavoritosComponent } from './aplicacion/tatuajes-favoritos/tatuajes-favoritos.component';
import { MiPortfolioComponent } from './aplicacion/trabajos/mi-portfolio/mi-portfolio.component';
import { BuscarTatuadorComponent } from './aplicacion/buscar-tatuador/buscar-tatuador.component';
import { TerminosComponent } from './pages/terminos/terminos.component';
import { PrivacidadComponent } from './pages/privacidad/privacidad.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { SolicitudesTatuadorComponent } from './aplicacion/solicitudes-tatuador/solicitudes-tatuador.component';

const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: HomeComponent },
  { path: 'not-authorized', component: NotAuthorizedComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'soporte', component: SoporteComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgotPass', component: ForgotPassComponent },
  { path: 'reset-password', component: ResetPassComponent },
  { path: 'info', component: PersonalDetailsComponent },
  { path: 'support-ticket', component: SupportTicketComponent, canActivate: [adminModGuard] },
  { path: 'especialidades', component: EspecialidadesComponent, canActivate: [adminModGuard] },
  { path: 'solicitudes-tatuador', component: SolicitudesTatuadorComponent, canActivate: [adminGuard] },
  { path: 'gestionar-agenda', component: AgendaComponent, canActivate: [ /* AuthGuard de Tatuador */] },
  {
    path: 'reserva',
    loadChildren: () => import('./aplicacion/reserva/reserva-routing.module.js').then(m => m.ReservaRoutingModule)
  },
  {
    path: 'mis-reservas',
    component: MisReservasComponent
  },
  { path: 'mis-favoritos', component: TatuajesFavoritosComponent },
  { path: 'buscar', component: BuscarTatuadorComponent },
  { path: 'mi-portfolio', component: MiPortfolioComponent },
  { path: 'perfil-publico/:id', component: PortfolioComponent },
  { path: 'terminos', component: TerminosComponent },
  { path: 'privacidad', component: PrivacidadComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '**', redirectTo: '/inicio', pathMatch: 'full' }, //redireccionar a inicio si no hay match
  // Carga diferida (lazy loading) para el flujo de prereserva

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
