import { Tatuador } from "../tatuador/tatuador.model";

export interface Trabajo {
  id: number;
  descripcion?: string;
  instagramMediaId?: string;
  // URLs de las fotos del trabajo.
  fotos: string[];
  tatuador?: Tatuador;
  likesCount: number;
  likedByMe: boolean;
  creationTimestamp?: string;
  status?: string;
}
