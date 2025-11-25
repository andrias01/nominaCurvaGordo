// ============================================================================
// EJEMPLO: HOOKS PERSONALIZADOS PARA INTEGRACIÓN CON BACKEND
// ============================================================================

// Este archivo muestra cómo crear hooks reutilizables para comunicación
// con un backend en FastAPI. Copiar en src/services/ cuando el backend esté listo.

// ============================================================================
// useEmployees.ts
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface Employee {
  id: string;
  nombreCompleto: string;
  tipoContrato: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  rol: string;
  activo: boolean;
  sede: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useEmployees = (sede: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch empleados cuando cambia la sede
  useEffect(() => {
    if (!sede) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/employees/sede/${sede}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [sede]);

  // Crear empleado
  const createEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const newEmployee = await response.json();
      setEmployees([...employees, newEmployee]);
      return newEmployee;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Actualizar empleado
  const updateEmployee = useCallback(async (id: string, employee: Omit<Employee, 'id'>) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const updatedEmployee = await response.json();
      setEmployees(employees.map(e => e.id === id ? updatedEmployee : e));
      return updatedEmployee;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  // Eliminar empleado
  const deleteEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [employees]);

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};

// ============================================================================
// useSchedules.ts
// ============================================================================

interface Shift {
  numero: number;
  horaInicio: string;
  horaFin: string;
}

interface EmployeeShiftAssignment {
  employeeId: string;
  tipoJornada: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  turno?: number;
}

interface Schedule {
  id: string;
  nombre: string;
  sede: string;
  diasTrabajo: string[];
  horaApertura: string;
  horaCierre: string;
  turnos: Shift[];
  mes: number;
  anio: number;
  empleadosAsignados: EmployeeShiftAssignment[];
  createdAt: string;
}

export const useSchedules = (sede: string | null) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch horarios cuando cambia la sede
  useEffect(() => {
    if (!sede) {
      setSchedules([]);
      return;
    }

    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/schedules/sede/${sede}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setSchedules(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMsg);
        console.error('Error fetching schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [sede]);

  // Crear horario
  const createSchedule = useCallback(async (schedule: Omit<Schedule, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      return newSchedule;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schedules]);

  // Actualizar horario
  const updateSchedule = useCallback(async (id: string, schedule: Omit<Schedule, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const updatedSchedule = await response.json();
      setSchedules(schedules.map(s => s.id === id ? updatedSchedule : s));
      return updatedSchedule;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schedules]);

  // Eliminar horario
  const deleteSchedule = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schedules/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [schedules]);

  // Obtener un horario específico
  const getSchedule = useCallback(async (id: string): Promise<Schedule> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/schedules/${id}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const schedule = await response.json();
      return schedule;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    schedules,
    loading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedule,
  };
};

// ============================================================================
// EJEMPLO DE USO EN ScheduleManager.tsx
// ============================================================================

/*
import { useEmployees } from '../services/useEmployees';
import { useSchedules } from '../services/useSchedules';

const ScheduleManager: React.FC = () => {
  const [selectedSede, setSelectedSede] = useState<string | null>(null);
  
  // Usar hooks personalizados
  const { 
    employees, 
    loading: empLoading, 
    error: empError,
    createEmployee, 
    updateEmployee, 
    deleteEmployee 
  } = useEmployees(selectedSede);

  const { 
    schedules, 
    loading: schLoading, 
    error: schError,
    createSchedule, 
    updateSchedule, 
    deleteSchedule 
  } = useSchedules(selectedSede);

  if (!selectedSede) {
    return <SedeSelect onSelect={setSelectedSede} />;
  }

  // Mostrar errores si existen
  if (empError || schError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">
          Error: {empError || schError}
        </div>
      </div>
    );
  }

  // Mostrar loading si está cargando
  if (empLoading || schLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  // El resto del código igual pero usando las funciones del hook
  return (
    // ... resto del componente
  );
};
*/

// ============================================================================
// CONFIGURACIÓN EN .env.local
// ============================================================================

/*
VITE_API_URL=http://localhost:8000
*/

// ============================================================================
// INSTALACIÓN DE DEPENDENCIAS
// ============================================================================

/*
npm install
# Ya está incluido en las dependencias base de React + Vite
*/

// ============================================================================
// NOTAS IMPORTANTE
// ============================================================================

/*
1. Los hooks usan fetch API que es nativa en navegadores modernos
2. Para versiones antiguas, reemplazar con axios o request
3. Los errores se propagan con throw para que el componente pueda manejarlos
4. El estado loading es útil para mostrar spinners o deshabilitar botones
5. El estado error permite mostrar mensajes al usuario
6. Las funciones son memoizadas con useCallback para evitar renders innecesarios
7. El API_URL se lee de variables de entorno (VITE_API_URL)

EJEMPLO DE USO EN COMPONENTE:

const handleAddEmployee = async (emp: Employee) => {
  try {
    await createEmployee(emp);
    // Success - el hook actualiza el estado automáticamente
    alert('Empleado creado exitosamente');
  } catch (err) {
    alert('Error al crear empleado: ' + err.message);
  }
};

const handleDeleteSchedule = async (id: string) => {
  if (!confirm('¿Estás seguro?')) return;
  try {
    await deleteSchedule(id);
    alert('Horario eliminado');
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
};
*/
