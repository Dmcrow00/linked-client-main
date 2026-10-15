export interface TurnoMensaje {
  id: number;
  texto: string;
  leido: boolean;
  usuarioEnviaId: number | null;
  usuarioEnviaUsername: string | null;
  creationTimestamp?: string;
}
