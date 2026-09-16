import { TurnoMensaje } from './turno-mensaje.model';
import { User } from '../user.model';

export interface TurnoSesion {
  id: number;
  cliente?: User;
  estado: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  descripcionCliente?: string;
  tatuadores?: User[];
  // URLs de las imágenes de referencia.
  imagenesRef?: string[];
  mensajes?: TurnoMensaje[];
  creationTimestamp?: string;
}
