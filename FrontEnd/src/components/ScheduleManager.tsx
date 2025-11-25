import React, { useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Employee {
  id: string;
  nombreCompleto: string;
  tipoContrato: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  rol: string;
  activo: boolean;
  sede: string;
}

interface EmployeeShiftAssignment {
  employeeId: string;
  tipoJornada: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  turno?: number; // 1, 2, o 3
}

interface Shift {
  numero: number;
  horaInicio: string;
  horaFin: string;
}

interface DayHours {
  dia: string; // 'lunes', 'martes', etc.
  horaInicio: string;
  horaFin: string;
}

interface EmployeeBalance {
  employeeId: string;
  saldoInicial: number; // horas a favor (negativo) o debe (positivo)
  ultimaActualizacion: string;
}

interface Schedule {
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

interface FormData {
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

interface WorkTimeConfig {
  sede: string;
  anio: number;
  horasMensTC: number;
  horasMensMT: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const SEDES = [
  'Amagá',
  'Paso Nivel',
  'Girardota',
  'Variante Caldas',
  'Guarne',
  'Campestre',
];

const MOCK_EMPLOYEES: Employee[] = [
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

const MOCK_SCHEDULES: Schedule[] = [
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

const DIAS_SEMANA = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
];

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

interface SedeSelectProps {
  onSelect: (sede: string) => void;
}

const SedeSelect: React.FC<SedeSelectProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-12">
          <div className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-slate-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-700">🍽️</div>
              <div className="text-sm font-semibold text-slate-600 mt-2">
                LA CURVA DEL GORDO
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Gestor de Horarios
          </h1>
          <p className="text-lg text-slate-600">
            ¿De qué sede desea configurar el horario?
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEDES.map((sede) => (
            <button
              key={sede}
              onClick={() => onSelect(sede)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 cursor-pointer group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                🏪
              </div>
              <h2 className="text-xl font-semibold text-slate-700 group-hover:text-blue-600">
                {sede}
              </h2>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EMPLOYEES TAB COMPONENT
// ============================================================================

interface EmployeesTabProps {
  sede: string;
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeesTab: React.FC<EmployeesTabProps> = ({
  sede,
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoContrato: 'tiempo_completo' as const,
    rol: '',
  });

  const sedeEmployees = employees.filter((e) => e.sede === sede);
  const filteredEmployees = sedeEmployees.filter((e) => {
    const matchesSearch = e.nombreCompleto
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = !filterTipo || e.tipoContrato === filterTipo;
    return matchesSearch && matchesFilter;
  });

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        nombreCompleto: employee.nombreCompleto,
        tipoContrato: employee.tipoContrato,
        rol: employee.rol,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombreCompleto: '',
        tipoContrato: 'tiempo_completo',
        rol: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nombreCompleto.trim() || !formData.rol.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (editingId) {
      onEditEmployee({
        id: editingId,
        ...formData,
        activo: true,
        sede,
      });
    } else {
      onAddEmployee({
        id: Date.now().toString(),
        ...formData,
        activo: true,
        sede,
      });
    }

    setShowModal(false);
  };

  const getTipoContratoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      tiempo_completo: 'Tiempo Completo',
      medio_tiempo: 'Medio Tiempo',
      extra: 'Extra',
    };
    return labels[tipo] || tipo;
  };

  const getTipoContratoBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      tiempo_completo: 'bg-green-100 text-green-800',
      medio_tiempo: 'bg-blue-100 text-blue-800',
      extra: 'bg-orange-100 text-orange-800',
    };
    return colors[tipo] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
        >
          <option value="">Todos los tipos de contrato</option>
          <option value="tiempo_completo">Tiempo Completo</option>
          <option value="medio_tiempo">Medio Tiempo</option>
          <option value="extra">Extra</option>
        </select>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
        >
          + Agregar Empleado
        </button>
      </div>

      {/* Employees table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-lg">No hay empleados para esta búsqueda</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Tipo de Contrato
                </th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Rol
                </th>
                <th className="text-center px-6 py-3 font-semibold text-slate-700 text-sm">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {emp.nombreCompleto}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTipoContratoBadgeColor(
                        emp.tipoContrato
                      )}`}
                    >
                      {getTipoContratoLabel(emp.tipoContrato)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{emp.rol}</td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => handleOpenModal(emp)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteEmployee(emp.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Contrato
              </label>
              <select
                value={formData.tipoContrato}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipoContrato: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tiempo_completo">Tiempo Completo</option>
                <option value="medio_tiempo">Medio Tiempo</option>
                <option value="extra">Extra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rol
              </label>
              <input
                type="text"
                value={formData.rol}
                onChange={(e) =>
                  setFormData({ ...formData, rol: e.target.value })
                }
                placeholder="e.g., Mesero, Cajero, Cocina"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SCHEDULES TAB COMPONENT
// ============================================================================

interface SchedulesTabProps {
  sede: string;
  employees: Employee[];
  schedules: Schedule[];
  onCreateSchedule: (schedule: Schedule) => void;
  onUpdateSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
  selectedScheduleId?: string | null;
  onSelectSchedule?: (id: string | null) => void;
}

interface SchedulesTabProps {
  sede: string;
  employees: Employee[];
  schedules: Schedule[];
  onCreateSchedule: (schedule: Schedule) => void;
  onUpdateSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
  selectedScheduleId?: string | null;
  onSelectSchedule?: (id: string | null) => void;
  getWorkTimeConfig?: (sede: string, anio: number) => WorkTimeConfig | undefined;
}

const SchedulesTab: React.FC<SchedulesTabProps> = ({
  sede,
  employees,
  schedules,
  onCreateSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  selectedScheduleId: selectedScheduleIdProp,
  onSelectSchedule,
  getWorkTimeConfig,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [selectedScheduleIdLocal, setSelectedScheduleIdLocal] = useState<
    string | null
  >(null);

  const currentSelectedId =
    typeof selectedScheduleIdProp !== 'undefined'
      ? selectedScheduleIdProp
      : selectedScheduleIdLocal;

  const setCurrentSelectedId = (id: string | null) => {
    if (onSelectSchedule) onSelectSchedule(id);
    else setSelectedScheduleIdLocal(id);
  };

  const sedeSchedules = schedules.filter((s) => s.sede === sede);
  const selectedSchedule = sedeSchedules.find((s) => s.id === currentSelectedId);

  const sedeEmployees = employees.filter((e) => e.sede === sede);

  return (
    <div className="space-y-6">
      {/* Schedule selector and create button */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Seleccionar Horario
          </label>
          <select
            value={currentSelectedId || ''}
            onChange={(e) => {
              setCurrentSelectedId(e.target.value || null);
              setShowForm(false);
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Selecciona un horario --</option>
            {sedeSchedules.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingScheduleId(null);
            setCurrentSelectedId(null);
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap mt-6 md:mt-0"
        >
          + Crear Horario
        </button>
        {/* Visualizar Horario moved to main tab bar */}
      </div>

      {/* Create/Edit Schedule Form */}
      {showForm && (
        <ScheduleForm
          sede={sede}
          employees={sedeEmployees}
          existingSchedule={
            editingScheduleId
              ? sedeSchedules.find((s) => s.id === editingScheduleId)
              : undefined
          }
          getWorkTimeConfig={getWorkTimeConfig}
          onSave={(schedule) => {
            if (editingScheduleId) {
              onUpdateSchedule({ ...schedule, id: editingScheduleId });
            } else {
              onCreateSchedule(schedule);
            }
            setShowForm(false);
            setCurrentSelectedId(schedule.id);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingScheduleId(null);
          }}
        />
      )}

      {/* Schedule Detail View */}
      {selectedSchedule && !showForm && (
        <ScheduleDetailView
          schedule={selectedSchedule}
          employees={sedeEmployees}
          onEdit={() => {
            setEditingScheduleId(selectedSchedule.id);
            setShowForm(true);
          }}
          onDelete={() => {
              if (
                window.confirm('¿Estás seguro de que deseas eliminar este horario?')
              ) {
                onDeleteSchedule(selectedSchedule.id);
                setCurrentSelectedId(null);
              }
          }}
        />
      )}

      {/* Empty state */}
      {!showForm && !selectedSchedule && sedeSchedules.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600 text-lg mb-4">
            No hay horarios creados para esta sede.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Crear el primer horario
          </button>
        </div>
      )}

      {/* DecadesPanel is controlled from parent ScheduleManager */}
    </div>
  );
};

// ============================================================================
// SCHEDULE FORM COMPONENT
// ============================================================================

interface ScheduleFormProps {
  sede: string;
  employees: Employee[];
  existingSchedule?: Schedule;
  getWorkTimeConfig?: (sede: string, anio: number) => WorkTimeConfig | undefined;
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  sede,
  employees,
  existingSchedule,
  getWorkTimeConfig,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState<FormData>(() => {
    if (existingSchedule) {
      return {
        diasTrabajo: existingSchedule.diasTrabajo,
        horaApertura: existingSchedule.horaApertura,
        horaCierre: existingSchedule.horaCierre,
        tieneTurnos: existingSchedule.turnos.length > 1,
        cantidadTurnos: existingSchedule.turnos.length,
        turnos: existingSchedule.turnos,
        mes: existingSchedule.mes,
        anio: existingSchedule.anio,
        horasMensTC: existingSchedule.horasMensTC ?? 160,
        horasMensMT: existingSchedule.horasMensMT ?? 80,
      };
    }
    const todayYear = new Date().getFullYear();
    const cfg = getWorkTimeConfig ? getWorkTimeConfig(sede, todayYear) : undefined;
    return {
      diasTrabajo: [],
      horaApertura: '09:00',
      horaCierre: '18:00',
      tieneTurnos: false,
      cantidadTurnos: 1,
      turnos: [{ numero: 1, horaInicio: '09:00', horaFin: '18:00' }],
      mes: new Date().getMonth() + 1,
      anio: todayYear,
      horasMensTC: cfg?.horasMensTC ?? 160,
      horasMensMT: cfg?.horasMensMT ?? 80,
    };
  });

  const [assignedEmployees, setAssignedEmployees] = useState<
    Map<string, EmployeeShiftAssignment>
  >(
    existingSchedule
      ? new Map(
          existingSchedule.empleadosAsignados.map((a) => [a.employeeId, a])
        )
      : new Map()
  );

  const [step, setStep] = useState<'basic' | 'assignments'>('basic');

  const handleDayToggle = (day: string) => {
    setForm((prev) => ({
      ...prev,
      diasTrabajo: prev.diasTrabajo.includes(day)
        ? prev.diasTrabajo.filter((d) => d !== day)
        : [...prev.diasTrabajo, day],
    }));
  };

  const handleTurnosChange = (cantidad: number) => {
    const newTurnos: Shift[] = [];
    for (let i = 1; i <= cantidad; i++) {
      if (form.turnos.find((t) => t.numero === i)) {
        newTurnos.push(form.turnos.find((t) => t.numero === i)!);
      } else {
        newTurnos.push({
          numero: i,
          horaInicio: '09:00',
          horaFin: '18:00',
        });
      }
    }
    setForm((prev) => ({
      ...prev,
      cantidadTurnos: cantidad,
      turnos: newTurnos,
    }));
  };

  const handleTurnoTimeChange = (
    turnoNum: number,
    field: 'horaInicio' | 'horaFin',
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      turnos: prev.turnos.map((t) =>
        t.numero === turnoNum ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleEmployeeAssignment = (employeeId: string, assigned: boolean) => {
    setAssignedEmployees((prev) => {
      const next = new Map(prev);
      if (assigned) {
        next.set(employeeId, {
          employeeId,
          tipoJornada: 'tiempo_completo',
          turno: form.turnos.length > 1 ? 1 : undefined,
        });
      } else {
        next.delete(employeeId);
      }
      return next;
    });
  };

  const handleEmployeeJornada = (
    employeeId: string,
    tipoJornada: 'tiempo_completo' | 'medio_tiempo' | 'extra'
  ) => {
    setAssignedEmployees((prev) => {
      const next = new Map(prev);
      const current = next.get(employeeId);
      if (current) {
        next.set(employeeId, { ...current, tipoJornada });
      }
      return next;
    });
  };

  const handleEmployeeTurno = (employeeId: string, turno: number) => {
    setAssignedEmployees((prev) => {
      const next = new Map(prev);
      const current = next.get(employeeId);
      if (current) {
        next.set(employeeId, { ...current, turno });
      }
      return next;
    });
  };

  const assignAllAsFullTime = () => {
    const newAssignments = new Map<string, EmployeeShiftAssignment>();
    employees.forEach((emp) => {
      newAssignments.set(emp.id, {
        employeeId: emp.id,
        tipoJornada: 'tiempo_completo',
        turno: form.turnos.length > 1 ? 1 : undefined,
      });
    });
    setAssignedEmployees(newAssignments);
  };

  const validateBasic = (): boolean => {
    if (form.diasTrabajo.length === 0) {
      alert('Selecciona al menos un día de trabajo');
      return false;
    }
    if (form.horaApertura >= form.horaCierre) {
      alert('La hora de apertura debe ser menor que la hora de cierre');
      return false;
    }
    for (const turno of form.turnos) {
      if (turno.horaInicio >= turno.horaFin) {
        alert(
          `El turno ${turno.numero}: La hora de inicio debe ser menor que la hora de fin`
        );
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (assignedEmployees.size === 0) {
      alert('Asigna al menos un empleado al horario');
      return;
    }

    const nombreHorario = `Horario ${sede} - ${MESES[form.mes - 1]} ${form.anio}`;

    const newSchedule: Schedule = {
      id: existingSchedule?.id || `sch-${Date.now()}`,
      nombre: nombreHorario,
      sede,
      diasTrabajo: form.diasTrabajo,
      horaApertura: form.horaApertura,
      horaCierre: form.horaCierre,
      turnos: form.turnos,
      mes: form.mes,
      anio: form.anio,
      horasMensTC: form.horasMensTC,
      horasMensMT: form.horasMensMT,
      empleadosAsignados: Array.from(assignedEmployees.values()),
      daysHours: form.usarHorasPorDia ? form.daysHours : undefined,
      createdAt: existingSchedule?.createdAt || new Date().toISOString(),
    };

    onSave(newSchedule);
  };

  if (step === 'basic') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Crear Nuevo Horario
          </h3>

          {/* Days selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-4">
              Días de Trabajo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIAS_SEMANA.map((day) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.diasTrabajo.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                  />
                  <span className="text-slate-700 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Option: Custom hours per day */}
          <div className="mb-8">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.usarHorasPorDia || false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    usarHorasPorDia: e.target.checked,
                    daysHours: e.target.checked
                      ? form.diasTrabajo.map((d) => ({
                          dia: d,
                          horaInicio: form.horaApertura,
                          horaFin: form.horaCierre,
                        }))
                      : undefined,
                  })
                }
                className="w-4 h-4 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-slate-700 font-medium">
                ¿Definir horarios distintos para cada día?
              </span>
            </label>
          </div>

          {/* Custom hours per day configuration */}
          {form.usarHorasPorDia && form.daysHours && (
            <div className="mb-8 space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-slate-800 text-sm">
                Horarios Personalizados por Día
              </h4>
              <div className="space-y-3">
                {form.daysHours.map((dh) => (
                  <div key={dh.dia} className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        {dh.dia.charAt(0).toUpperCase() + dh.dia.slice(1)}
                      </label>
                      <span className="text-slate-600 text-sm capitalize">
                        {dh.dia}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Inicio
                      </label>
                      <input
                        type="time"
                        value={dh.horaInicio}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            daysHours: form.daysHours!.map((d) =>
                              d.dia === dh.dia
                                ? { ...d, horaInicio: e.target.value }
                                : d
                            ),
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Fin
                      </label>
                      <input
                        type="time"
                        value={dh.horaFin}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            daysHours: form.daysHours!.map((d) =>
                              d.dia === dh.dia
                                ? { ...d, horaFin: e.target.value }
                                : d
                            ),
                          })
                        }
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General hours */}
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Apertura
              </label>
              <input
                type="time"
                value={form.horaApertura}
                onChange={(e) =>
                  setForm({ ...form, horaApertura: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={form.horaCierre}
                onChange={(e) =>
                  setForm({ ...form, horaCierre: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Multiple shifts */}
          <div className="mb-8">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.tieneTurnos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tieneTurnos: e.target.checked,
                    cantidadTurnos: e.target.checked ? 2 : 1,
                    turnos: e.target.checked
                      ? [
                          { numero: 1, horaInicio: '08:00', horaFin: '14:00' },
                          { numero: 2, horaInicio: '14:00', horaFin: '22:00' },
                        ]
                      : [{ numero: 1, horaInicio: form.horaApertura, horaFin: form.horaCierre }],
                  })
                }
                className="w-4 h-4 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-slate-700 font-medium">
                ¿La sede tiene varios turnos?
              </span>
            </label>
          </div>

          {/* Shift configuration */}
          {form.tieneTurnos && (
            <div className="mb-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Cantidad de Turnos
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleTurnosChange(num)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        form.cantidadTurnos === num
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {num} turno{num > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {form.turnos.map((turno) => (
                  <div key={turno.numero} className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-3">
                      Turno {turno.numero}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2">
                          Hora de Inicio
                        </label>
                        <input
                          type="time"
                          value={turno.horaInicio}
                          onChange={(e) =>
                            handleTurnoTimeChange(
                              turno.numero,
                              'horaInicio',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-2">
                          Hora de Fin
                        </label>
                        <input
                          type="time"
                          value={turno.horaFin}
                          onChange={(e) =>
                            handleTurnoTimeChange(
                              turno.numero,
                              'horaFin',
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month and year */}
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mes
              </label>
              <select
                value={form.mes}
                onChange={(e) =>
                  setForm({ ...form, mes: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MESES.map((mes, idx) => (
                  <option key={mes} value={idx + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Año
              </label>
              <select
                value={form.anio}
                onChange={(e) =>
                  setForm({ ...form, anio: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly hours configuration */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-700 mb-4">
              Horas Requeridas Mensualmente
            </h4>
            <div className="grid grid-cols-2 gap-6 bg-green-50 p-4 rounded-lg border border-green-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tiempo Completo (horas/mes)
                </label>
                <input
                  type="number"
                  value={form.horasMensTC}
                  onChange={(e) =>
                    setForm({ ...form, horasMensTC: parseInt(e.target.value) || 160 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-slate-600 mt-1">Horas mensuales para empleados TC</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Medio Tiempo (horas/mes)
                </label>
                <input
                  type="number"
                  value={form.horasMensMT}
                  onChange={(e) =>
                    setForm({ ...form, horasMensMT: parseInt(e.target.value) || 80 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-slate-600 mt-1">Horas mensuales para empleados MT</p>
              </div>
            </div>
          </div>

          {/* Next button */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (validateBasic()) {
                  setStep('assignments');
                }
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Siguiente: Asignar Empleados
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Assignments
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          Asignar Empleados
        </h3>
        <p className="text-slate-600 mb-6">
          Selecciona los empleados para este horario
        </p>

        {/* Batch actions */}
        <div className="mb-6">
          <button
            onClick={assignAllAsFullTime}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            Asignar todos como tiempo completo
          </button>
        </div>

        {/* Employees assignment table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Asignar
                </th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Empleado
                </th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Tipo de Jornada
                </th>
                {form.turnos.length > 1 && (
                  <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                    Turno
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((emp) => {
                const assigned = assignedEmployees.get(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={!!assigned}
                        onChange={(e) =>
                          handleEmployeeAssignment(emp.id, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {emp.nombreCompleto}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={assigned?.tipoJornada || 'tiempo_completo'}
                        onChange={(e) =>
                          handleEmployeeJornada(emp.id, e.target.value as any)
                        }
                        disabled={!assigned}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="tiempo_completo">
                          Tiempo Completo
                        </option>
                        <option value="medio_tiempo">Medio Tiempo</option>
                        <option value="extra">Extra</option>
                      </select>
                    </td>
                    {form.turnos.length > 1 && (
                      <td className="px-6 py-4">
                        <select
                          value={assigned?.turno || 1}
                          onChange={(e) =>
                            handleEmployeeTurno(emp.id, parseInt(e.target.value))
                          }
                          disabled={!assigned}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          {form.turnos.map((t) => (
                            <option key={t.numero} value={t.numero}>
                              Turno {t.numero}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-600 mt-4">
          <strong>Empleados asignados:</strong> {assignedEmployees.size} /{' '}
          {employees.length}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-6 border-t border-slate-200">
        <button
          onClick={() => setStep('basic')}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          ← Atrás
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Guardar Horario
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SCHEDULE DETAIL VIEW COMPONENT
// ============================================================================

interface ScheduleDetailViewProps {
  schedule: Schedule;
  employees: Employee[];
  onEdit: () => void;
  onDelete: () => void;
}

const ScheduleDetailView: React.FC<ScheduleDetailViewProps> = ({
  schedule,
  employees,
  onEdit,
  onDelete,
}) => {
  const getTipoJornadaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      tiempo_completo: 'Tiempo Completo',
      medio_tiempo: 'Medio Tiempo',
      extra: 'Extra',
    };
    return labels[tipo] || tipo;
  };

  const getTipoJornadaBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      tiempo_completo: 'bg-green-100 text-green-800',
      medio_tiempo: 'bg-blue-100 text-blue-800',
      extra: 'bg-orange-100 text-orange-800',
    };
    return colors[tipo] || 'bg-slate-100 text-slate-800';
  };

  const getEmployeeName = (id: string) => {
    return employees.find((e) => e.id === id)?.nombreCompleto || 'Desconocido';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Summary card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              {schedule.nombre}
            </h2>
            <p className="text-slate-600">
              {MESES[schedule.mes - 1]} {schedule.anio} • {schedule.sede}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Editar
            </button>
            
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Días
            </p>
            <p className="text-slate-800 font-medium capitalize">
              {schedule.diasTrabajo.join(', ')}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Horario
            </p>
            <p className="text-slate-800 font-medium">
              {schedule.horaApertura} - {schedule.horaCierre}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Turnos
            </p>
            <p className="text-slate-800 font-medium">
              {schedule.turnos.length}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
              Empleados
            </p>
            <p className="text-slate-800 font-medium">
              {schedule.empleadosAsignados.length}
            </p>
          </div>
        </div>
      </div>

      {/* Shifts detail */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Turnos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedule.turnos.map((turno) => (
            <div
              key={turno.numero}
              className="bg-slate-50 rounded-lg p-4 border border-slate-200"
            >
              <h4 className="font-semibold text-slate-700 mb-2">
                Turno {turno.numero}
              </h4>
              <p className="text-slate-800 font-medium">
                {turno.horaInicio} - {turno.horaFin}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Employees assignments table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6">
          Empleados Asignados
        </h3>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Empleado
                </th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                  Tipo de Jornada
                </th>
                {schedule.turnos.length > 1 && (
                  <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">
                    Turno
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schedule.empleadosAsignados.map((assignment) => (
                <tr
                  key={assignment.employeeId}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {getEmployeeName(assignment.employeeId)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTipoJornadaBadgeColor(
                        assignment.tipoJornada
                      )}`}
                    >
                      {getTipoJornadaLabel(assignment.tipoJornada)}
                    </span>
                  </td>
                  {schedule.turnos.length > 1 && (
                    <td className="px-6 py-4 text-slate-800">
                      Turno {assignment.turno}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>

      
    </>
  );
};

// ============================================================================
// DECADES PANEL COMPONENT
// ============================================================================

interface DecadesPanelProps {
  schedule: Schedule;
  employees: Employee[];
  onClose: () => void;
  getWorkTimeConfig?: (sede: string, anio: number) => WorkTimeConfig | undefined;
}

const DecadesPanel: React.FC<DecadesPanelProps> = ({
  schedule,
  employees,
  onClose,
  getWorkTimeConfig,
}) => {
  const [viewMonth, setViewMonth] = useState<number>(schedule.mes);
  const [viewYear, setViewYear] = useState<number>(schedule.anio);

  const monthDays = (m: number, y: number) => {
    return new Date(y, m, 0).getDate();
  };

  const getDayName = (dateObj: Date) => {
    const names = [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
    ];
    return names[dateObj.getDay()];
  };

  const parseHours = (timeStr: string) => {
    const [hh, mm] = timeStr.split(':').map(Number);
    return hh + mm / 60;
  };

  const shiftHours = (turno?: Shift) => {
    if (!turno) return 0;
    const start = parseHours(turno.horaInicio);
    const end = parseHours(turno.horaFin);
    return Math.max(0, end - start);
  };

  // Build array of days for the month
  const totalDays = monthDays(viewMonth, viewYear);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // month view will show all days in the selected month

  // Compute schedule assignments map by employee
  const assignmentsMap = new Map<string, EmployeeShiftAssignment>();
  schedule.empleadosAsignados.forEach((a) => assignmentsMap.set(a.employeeId, a));

  const workers = employees.filter((e) => assignmentsMap.has(e.id));

  const computeDayWorked = (
    employeeId: string,
    day: number
  ): { hours: number; note?: string } => {
    const assignment = assignmentsMap.get(employeeId);
    if (!assignment) return { hours: 0, note: 'No asignado' };
    const dateObj = new Date(viewYear, viewMonth - 1, day);
    const dayName = getDayName(dateObj);
    if (!schedule.diasTrabajo.includes(dayName)) {
      return { hours: 0, note: 'No trabaja' };
    }

    // Check if there are custom day hours
    let turnoObj: Shift | undefined;
    if (schedule.daysHours && schedule.daysHours.length > 0) {
      const dayHours = schedule.daysHours.find((dh) => dh.dia === dayName);
      if (dayHours) {
        const start = parseHours(dayHours.horaInicio);
        const end = parseHours(dayHours.horaFin);
        const baseHours = Math.max(0, end - start);
        let hours = baseHours;
        if (assignment.tipoJornada === 'medio_tiempo') hours = baseHours / 2;
        if (assignment.tipoJornada === 'extra') hours = Math.min(4, baseHours);
        return { hours };
      }
    }

    // Otherwise use schedule.turnos
    if (schedule.turnos.length === 1) {
      turnoObj = schedule.turnos[0];
    } else {
      const tnum = assignment.turno || 1;
      turnoObj = schedule.turnos.find((t) => t.numero === tnum);
    }

    const baseHours = shiftHours(turnoObj);

    // Adjust by tipoJornada
    let hours = baseHours;
    if (assignment.tipoJornada === 'medio_tiempo') hours = baseHours / 2;
    if (assignment.tipoJornada === 'extra') hours = 4; // default for extras

    return { hours, note: hours === 0 ? 'No trabaja' : undefined };
  };

  const computeDecadeTotals = (employeeId: string, from: number, to: number) => {
    let total = 0;
    for (let d = from; d <= to; d++) {
      total += computeDayWorked(employeeId, d).hours;
    }
    return total;
  };

  const downloadCSV = () => {
    // Build a simple CSV string for the current view (one file per month)
    const header = ['Empleado', 'Tipo Contrato', 'Horas Trabajadas', 'Horas Teóricas', 'Saldo'];
    const rows: string[][] = [];
    workers.forEach((w) => {
      const assignment = assignmentsMap.get(w.id);
      if (!assignment) return;
      const horasTrabajadas = computeDecadeTotals(w.id, 1, totalDays);
      const horasTeoricas = calculateTheoreticalHours(w.id, 1, totalDays);
      const saldo = horasTeoricas - horasTrabajadas;
      rows.push([
        w.nombreCompleto,
        assignment.tipoJornada,
        horasTrabajadas.toFixed(2),
        horasTeoricas.toFixed(2),
        saldo.toFixed(2),
      ]);
    });
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schedule.nombre.replace(/\s+/g, '_')}_${viewMonth}_${viewYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateTheoreticalHours = (employeeId: string, from: number, to: number): number => {
    const assignment = assignmentsMap.get(employeeId);
    if (!assignment) return 0;
    let total = 0;
    for (let d = from; d <= to; d++) {
      const dateObj = new Date(viewYear, viewMonth - 1, d);
      const dayName = getDayName(dateObj);
      if (schedule.diasTrabajo.includes(dayName)) {
          // Determine monthly requirements with fallbacks
          const cfg = getWorkTimeConfig ? getWorkTimeConfig(schedule.sede, viewYear) : undefined;
          const tcMonthly = schedule.horasMensTC ?? cfg?.horasMensTC ?? 160;
          const mtMonthly = schedule.horasMensMT ?? cfg?.horasMensMT ?? 80;
          // Calculate theoretical hours for this employee on this day (approx by dividing by 20 working days)
          if (assignment.tipoJornada === 'tiempo_completo') {
            total += tcMonthly / 20;
          } else if (assignment.tipoJornada === 'medio_tiempo') {
            total += mtMonthly / 20;
          } else if (assignment.tipoJornada === 'extra') {
            total += (tcMonthly / 2) / 20;
          }
      }
    }
    return total;
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black bg-opacity-40 overflow-auto">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-slate-200 gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800">{schedule.nombre}</h3>
            <p className="text-sm text-slate-600">Visualización Mensual • {MESES[viewMonth - 1]} {viewYear}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
            <button
              onClick={() => {
                setViewMonth((m) => (m === 1 ? 12 : m - 1));
                if (viewMonth === 1) setViewYear((y) => y - 1);
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              ◀
            </button>
            <button
              onClick={() => {
                setViewMonth((m) => (m === 12 ? 1 : m + 1));
                if (viewMonth === 12) setViewYear((y) => y + 1);
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              ▶
            </button>
            <button onClick={downloadCSV} className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors text-sm font-medium">
              📥 CSV
            </button>
            <button onClick={() => alert('Descarga PDF - pendiente implementar')} className="px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded transition-colors text-sm font-medium">
              📄 PDF
            </button>
            <button onClick={onClose} className="px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded transition-colors font-medium text-sm">
              Cerrar
            </button>
          </div>
        </div>

        {/* Content - Vertical layout */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h4 className="font-bold text-lg text-slate-800">{MESES[viewMonth - 1]} {viewYear}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Empleado</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-700">Tipo</th>
                    {days.map((d) => (
                      <th key={d} className="text-center px-2 py-3 font-semibold text-slate-600 text-xs">{d}</th>
                    ))}
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">Trabajadas</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">Teóricas</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-700">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workers.map((w) => {
                    const assignment = assignmentsMap.get(w.id);
                    if (!assignment) return null;
                    const horasTrabajadas = computeDecadeTotals(w.id, 1, totalDays);
                    const horasTeoricas = calculateTheoreticalHours(w.id, 1, totalDays);
                    const saldo = horasTeoricas - horasTrabajadas;
                    const saldoColor = saldo < 0 ? 'text-green-700' : saldo > 0 ? 'text-red-700' : 'text-slate-700';
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{w.nombreCompleto}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{assignment.tipoJornada === 'tiempo_completo' ? 'TC' : assignment.tipoJornada === 'medio_tiempo' ? 'MT' : 'EX'}</span>
                        </td>
                        {days.map((d) => {
                          const cell = computeDayWorked(w.id, d);
                          return <td key={d} className="text-center px-2 py-3 text-slate-700">{cell.hours > 0 ? cell.hours.toFixed(1) : '—'}</td>;
                        })}
                        <td className="text-right px-4 py-3 font-semibold text-slate-800">{horasTrabajadas.toFixed(1)} h</td>
                        <td className="text-right px-4 py-3 font-semibold text-slate-600">{horasTeoricas.toFixed(1)} h</td>
                        <td className={`text-right px-4 py-3 font-bold ${saldoColor}`}>{saldo < 0 ? '−' : ''}{Math.abs(saldo).toFixed(1)} h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">📋 Leyenda:</span> Horas <span className="text-green-700 font-semibold">negativas (−)</span> significan que el empleado tiene horas a su favor. Horas <span className="text-red-700 font-semibold">positivas</span> indican que debe horas. El saldo se calcula usando las horas mensuales configuradas para la sede/año (si existen) o los valores por defecto:
              <ul className="list-disc list-inside mt-2 ml-2 text-xs space-y-1">
                <li><strong>Tiempo Completo (TC):</strong> usa <em>horas mensuales TC</em> (p. ej. 160) distribuidas entre los días laborables</li>
                <li><strong>Medio Tiempo (MT):</strong> usa <em>horas mensuales MT</em> (p. ej. 80) distribuidas entre los días laborables</li>
                <li><strong>Extra (EX):</strong> usa la mitad de la carga TC como referencia</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface WorkTimeTabProps {
  sede: string;
  workTimeConfigs: WorkTimeConfig[];
  setWorkTimeConfigs: React.Dispatch<React.SetStateAction<WorkTimeConfig[]>>;
}

const WorkTimeTab: React.FC<WorkTimeTabProps> = ({
  sede,
  workTimeConfigs,
  setWorkTimeConfigs,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const existing = workTimeConfigs.find((c) => c.sede === sede && c.anio === selectedYear);
  const [horasTC, setHorasTC] = useState<number>(existing?.horasMensTC ?? 160);
  const [horasMT, setHorasMT] = useState<number>(existing?.horasMensMT ?? 80);

  React.useEffect(() => {
    const e = workTimeConfigs.find((c) => c.sede === sede && c.anio === selectedYear);
    setHorasTC(e?.horasMensTC ?? 160);
    setHorasMT(e?.horasMensMT ?? 80);
  }, [selectedYear, sede, workTimeConfigs]);

  const handleSave = () => {
    setWorkTimeConfigs((prev) => {
      const idx = prev.findIndex((p) => p.sede === sede && p.anio === selectedYear);
      const next = [...prev];
      const cfg: WorkTimeConfig = { sede, anio: selectedYear, horasMensTC: horasTC, horasMensMT: horasMT };
      if (idx >= 0) next[idx] = cfg;
      else next.push(cfg);
      return next;
    });
    alert('Configuración guardada');
  };

  const sedeConfigs = workTimeConfigs.filter((c) => c.sede === sede).sort((a,b)=>b.anio - a.anio);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sede</label>
            <input type="text" value={sede} readOnly className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
            <input type="number" value={selectedYear} onChange={(e)=>setSelectedYear(parseInt(e.target.value||String(currentYear)))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Guardar configuración</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tiempo Completo (horas/mes)</label>
            <input type="number" value={horasTC} onChange={(e)=>setHorasTC(parseInt(e.target.value||'160'))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Medio Tiempo (horas/mes)</label>
            <input type="number" value={horasMT} onChange={(e)=>setHorasMT(parseInt(e.target.value||'80'))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h4 className="font-semibold text-slate-800 mb-3">Configuraciones existentes (sede)</h4>
        {sedeConfigs.length === 0 ? (
          <p className="text-slate-600">No hay configuraciones para esta sede.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Año</th>
                <th className="text-left px-3 py-2 font-medium">TC (h/mes)</th>
                <th className="text-left px-3 py-2 font-medium">MT (h/mes)</th>
                <th className="text-right px-3 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sedeConfigs.map((c) => (
                <tr key={`${c.sede}-${c.anio}`}>
                  <td className="px-3 py-2">{c.anio}</td>
                  <td className="px-3 py-2">{c.horasMensTC}</td>
                  <td className="px-3 py-2">{c.horasMensMT}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={()=>{ setSelectedYear(c.anio); setHorasTC(c.horasMensTC); setHorasMT(c.horasMensMT); }} className="text-blue-600 hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const ScheduleManager: React.FC = () => {
  const [selectedSede, setSelectedSede] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'empleados' | 'horarios' | 'tiempo'>(
    'empleados'
  );
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [showDecades, setShowDecades] = useState(false);
  const [workTimeConfigs, setWorkTimeConfigs] = useState<WorkTimeConfig[]>([]);

  const getWorkTimeConfig = (sede: string, anio: number) =>
    workTimeConfigs.find((c) => c.sede === sede && c.anio === anio);

  // TODO: Reemplazar mocks por llamadas al backend en Python
  // Aquí iría la lógica para conectar a endpoints como:
  // - GET /api/employees/sede/{sede}
  // - GET /api/schedules/sede/{sede}
  // - POST /api/schedules
  // - PUT /api/schedules/{id}
  // - DELETE /api/schedules/{id}
  // - POST /api/employees
  // - PUT /api/employees/{id}
  // - DELETE /api/employees/{id}

  if (!selectedSede) {
    return <SedeSelect onSelect={setSelectedSede} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
              <div className="text-2xl">🍽️</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                La Curva Del Gordo
              </h1>
              <p className="text-slate-600 text-sm">
                Gestión de Horarios • {selectedSede}
              </p>
            </div>
          </div>

          {/* Change sede button */}
          <button
            onClick={() => setSelectedSede(null)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            ← Cambiar Sede
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs + actions */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('empleados')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'empleados'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-800'
              }`}
            >
              👥 Empleados
            </button>
            <button
              onClick={() => setActiveTab('horarios')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'horarios'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-800'
              }`}
            >
              📅 Horarios
            </button>
            <button
              onClick={() => setActiveTab('tiempo')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'tiempo'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-600 border-transparent hover:text-slate-800'
              }`}
            >
              ⏱️ Tiempo trabajo
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'horarios' && (
              <button
                onClick={() => setShowDecades(true)}
                disabled={!selectedScheduleId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Visualizar Horario
              </button>
            )}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'empleados' && (
          <EmployeesTab
            sede={selectedSede}
            employees={employees}
            onAddEmployee={(emp) => setEmployees([...employees, emp])}
            onEditEmployee={(emp) =>
              setEmployees(
                employees.map((e) => (e.id === emp.id ? emp : e))
              )
            }
            onDeleteEmployee={(id) =>
              setEmployees(employees.filter((e) => e.id !== id))
            }
          />
        )}

        {activeTab === 'horarios' && (
          <SchedulesTab
            sede={selectedSede}
            employees={employees}
            schedules={schedules}
            selectedScheduleId={selectedScheduleId}
            onSelectSchedule={setSelectedScheduleId}
            onCreateSchedule={(sch) => setSchedules([...schedules, sch])}
            onUpdateSchedule={(sch) =>
              setSchedules(
                schedules.map((s) => (s.id === sch.id ? sch : s))
              )
            }
            onDeleteSchedule={(id) =>
              setSchedules(schedules.filter((s) => s.id !== id))
            }
            getWorkTimeConfig={getWorkTimeConfig}
          />
        )}
        {activeTab === 'tiempo' && (
          <WorkTimeTab sede={selectedSede} workTimeConfigs={workTimeConfigs} setWorkTimeConfigs={setWorkTimeConfigs} />
        )}
        {showDecades && (
          (() => {
            const sch = schedules.find((s) => s.id === selectedScheduleId);
            if (!sch) return null;
            const sedeEmployees = employees.filter((e) => e.sede === sch.sede);
            return (
              <DecadesPanel
                schedule={sch}
                employees={sedeEmployees}
                onClose={() => setShowDecades(false)}
                getWorkTimeConfig={getWorkTimeConfig}
              />
            );
          })()
        )}
      </main>
    </div>
  );
};

export default ScheduleManager;
