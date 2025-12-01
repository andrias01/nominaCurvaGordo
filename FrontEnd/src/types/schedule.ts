export interface Employee {
  id: string;
  nombreCompleto: string;
  tipoContrato: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  rol: string;
  activo: boolean;
  sede: string;
}

export interface EmployeeShiftAssignment {
  employeeId: string;
  tipoJornada: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  turno?: number; // 1, 2 o 3
}

export interface Shift {
  numero: number;
  horaInicio: string;
  horaFin: string;
}

export interface DayHours {
  dia: string; // 'lunes', 'martes', etc.
  horaInicio: string;
  horaFin: string;
}

export interface EmployeeBalance {
  employeeId: string;
  saldoInicial: number; // horas a favor (negativo) o debe (positivo)
  ultimaActualizacion: string;
}

export interface Schedule {
  id: string;
  nombre: string;
  sede: string;
  diasTrabajo: string[]; // ['lunes', 'martes', ...]
  horaApertura: string;
  horaCierre: string;
  turnos: Shift[];
  mes: number; // 1-12
  anio: number;
  empleadosAsignados: EmployeeShiftAssignment[];
  daysHours?: DayHours[]; // horarios específicos por día
  employeeBalances?: EmployeeBalance[]; // saldos de horas por empleado
  horasMensTC?: number; // horas mensuales requeridas para tiempo completo (default 160)
  horasMensMT?: number; // horas mensuales requeridas para medio tiempo (default 80)
  createdAt: string;
}

export interface FormData {
  diasTrabajo: string[];
  horaApertura: string;
  horaCierre: string;
  tieneTurnos: boolean;
  cantidadTurnos: number;
  turnos: Shift[];
  mes: number;
  anio: number;
  usarHorasPorDia?: boolean; // Nueva opción
  daysHours?: DayHours[]; // Horarios personalizados por día
  horasMensTC: number; // horas mensuales requeridas para TC
  horasMensMT: number; // horas mensuales requeridas para MT
}

export interface WorkTimeConfig {
  sede: string;
  anio: number;
  horasMensTC: number;
  horasMensMT: number;
}
