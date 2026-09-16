// Payload de registro. El backend expone la fecha como "birth_date" y las
// especialidades como "especialidadIds", aunque el resto del contrato sea camelCase.
export class User {
  username: string = '';
  email: string = '';
  password?: string;
  realname: undefined | string = '';
  surname: undefined | string = '';
  birth_date?: Date;
  localidad?: string;
  lat?: number;
  lng?: number;
  estudio?: string;
  especialidadIds?: number[];
  recaptchaToken?: string | null;
}
