export class Especialidad {
  id = 0;
  nombre = '';
  descripcion = '';
  // El backend lo expone como "true" / "false".
  status = 'true';
}

// Alta y edición sólo aceptan estos campos.
export interface EspecialidadPayload {
  nombre: string;
  descripcion: string;
}
