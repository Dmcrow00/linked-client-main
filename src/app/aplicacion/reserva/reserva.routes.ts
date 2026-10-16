import { Routes } from '@angular/router';
import { ReservaComponent } from './reserva.component';
import { ListadoTatuadoresComponent } from './listado-tatuadores/listado-tatuadores.component';
import { SeleccionarHorarioComponent } from './seleccionar-horario/seleccionar-horario.component';
import { ConfirmacionReservaComponent } from './confirmacion-reserva/confirmacion-reserva.component';

export const RESERVA_ROUTES: Routes = [
  {
    path: '', // La ruta base será /reserva
    component: ReservaComponent,
    children: [
      { path: 'listado', component: ListadoTatuadoresComponent },
      // Usamos un parámetro (:tatuadorId) para pasar el ID
      { path: 'horarios/:tatuadorId', component: SeleccionarHorarioComponent },
      { path: 'confirmacion', component: ConfirmacionReservaComponent },
      // Redirección por defecto si entran a /reserva
      { path: '', redirectTo: 'listado', pathMatch: 'full' }
    ]
  }
];
