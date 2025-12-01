import { MOCK_EMPLOYEES, MOCK_SCHEDULES } from '../mocks/mockData';
import { Employee, Schedule, WorkTimeConfig } from '../types/schedule';

// Servicio preparado para conectarse a la API real
// Cada función devuelve una promesa para que, cuando exista backend,
// solo sea necesario reemplazar el cuerpo por un fetch/axios y dejar la interfaz intacta.

export const scheduleService = {
  async fetchEmployeesBySede(sede: string): Promise<Employee[]> {
    // TODO: reemplazar por GET /api/employees?sede={sede}
    return Promise.resolve(MOCK_EMPLOYEES.filter((e) => e.sede === sede));
  },

  async fetchSchedulesBySede(sede: string): Promise<Schedule[]> {
    // TODO: reemplazar por GET /api/schedules?sede={sede}
    return Promise.resolve(MOCK_SCHEDULES.filter((s) => s.sede === sede));
  },

  async saveSchedule(schedule: Schedule): Promise<Schedule> {
    // TODO: reemplazar por POST/PUT según tenga id
    return Promise.resolve(schedule);
  },

  async deleteSchedule(id: string): Promise<void> {
    // TODO: DELETE /api/schedules/{id}
    return Promise.resolve();
  },

  async saveEmployee(employee: Employee): Promise<Employee> {
    // TODO: POST /api/employees
    return Promise.resolve(employee);
  },

  async deleteEmployee(id: string): Promise<void> {
    // TODO: DELETE /api/employees/{id}
    return Promise.resolve();
  },

  async saveWorkTimeConfig(config: WorkTimeConfig): Promise<WorkTimeConfig> {
    // TODO: POST /api/work-config
    return Promise.resolve(config);
  },
};
