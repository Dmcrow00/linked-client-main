import { Especialidad } from '../aplicacion/gestion-sistema/especialidades/especialidades.model';
import { RolApl } from './rol.models';
import { Page } from './pagination';

export class User {
  id: number = 0;
  username: string = '';
  email?: string;
  realname?: string;
  surname?: string;
  birthDate?: string;
  profilePhoto?: string;
  estudio?: string;
  fechaInicioActividad?: string;
  localidad?: string;
  lat?: number;
  lng?: number;
  instagramHandle?: string;
  // El backend lo expone como "true" / "false".
  status?: string;
  roles?: RolApl[];
  especialidades?: Especialidad[];
  // Derivado en el cliente a partir de fechaInicioActividad.
  antiguedad?: number;
}

export interface UserPage extends Page<User> {
  content: User[];
}
