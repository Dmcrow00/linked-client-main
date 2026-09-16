export class Especialidad {
  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  // El backend lo expone como "true" / "false".
  status: string = 'true';
}

// Alta y edición sólo aceptan estos campos.
export interface EspecialidadPayload {
  nombre: string;
  descripcion: string;
}
