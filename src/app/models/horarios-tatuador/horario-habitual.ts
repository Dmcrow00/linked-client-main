export interface HorarioHabitual {
  id?: number;
  // 0 = domingo … 6 = sábado
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMin: number;
}

export interface HorarioHabitualInput {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMin: number;
}
