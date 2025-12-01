import { Employee, Schedule } from '../types/schedule';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    nombreCompleto: 'Carlos García López',
    tipoContrato: 'tiempo_completo',
    rol: 'Mesero',
    activo: true,
    sede: 'Amagá',
  },
  {
    id: '2',
    nombreCompleto: 'María Rodríguez Sánchez',
    tipoContrato: 'tiempo_completo',
    rol: 'Cajero',
    activo: true,
    sede: 'Amagá',
  },
  {
    id: '3',
    nombreCompleto: 'Juan Pérez Martínez',
    tipoContrato: 'medio_tiempo',
    rol: 'Cocina',
    activo: true,
    sede: 'Amagá',
  },
  {
    id: '4',
    nombreCompleto: 'Ana Gómez Silva',
    tipoContrato: 'extra',
    rol: 'Mesero',
    activo: true,
    sede: 'Amagá',
  },
  {
    id: '5',
    nombreCompleto: 'Roberto López Díaz',
    tipoContrato: 'tiempo_completo',
    rol: 'Gerente',
    activo: true,
    sede: 'Amagá',
  },
  {
    id: '6',
    nombreCompleto: 'Daniela Hernández Ruiz',
    tipoContrato: 'tiempo_completo',
    rol: 'Mesero',
    activo: true,
    sede: 'Paso Nivel',
  },
  {
    id: '7',
    nombreCompleto: 'Luis Fernando Castillo',
    tipoContrato: 'tiempo_completo',
    rol: 'Cocina',
    activo: true,
    sede: 'Paso Nivel',
  },
];

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 'sch-001',
    nombre: 'Horario Amagá - Noviembre 2025',
    sede: 'Amagá',
    diasTrabajo: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    horaApertura: '10:00',
    horaCierre: '23:00',
    turnos: [
      { numero: 1, horaInicio: '10:00', horaFin: '16:00' },
      { numero: 2, horaInicio: '16:00', horaFin: '23:00' },
    ],
    mes: 11,
    anio: 2025,
    empleadosAsignados: [
      { employeeId: '1', tipoJornada: 'tiempo_completo', turno: 1 },
      { employeeId: '2', tipoJornada: 'tiempo_completo', turno: 2 },
      { employeeId: '3', tipoJornada: 'medio_tiempo', turno: 1 },
      { employeeId: '4', tipoJornada: 'extra', turno: 2 },
      { employeeId: '5', tipoJornada: 'tiempo_completo', turno: 1 },
    ],
    createdAt: '2025-11-01T10:00:00Z',
  },
];
