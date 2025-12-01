import React, { useMemo, useState } from 'react';
import { DIAS_SEMANA, MESES } from '../mocks/constants';
import {
  Employee,
  EmployeeShiftAssignment,
  FormData,
  Schedule,
  Shift,
  WorkTimeConfig,
} from '../types/schedule';

interface Props {
  sede: string;
  employees: Employee[];
  existingSchedule?: Schedule;
  getWorkTimeConfig?: (sede: string, anio: number) => WorkTimeConfig | undefined;
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<Props> = ({
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
      ? new Map(existingSchedule.empleadosAsignados.map((a) => [a.employeeId, a]))
      : new Map()
  );

  const [step, setStep] = useState<'basic' | 'assignments'>('basic');

  const sedeEmployees = useMemo(
    () => employees.filter((e) => e.sede === sede),
    [employees, sede]
  );

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
        newTurnos.push({ numero: i, horaInicio: '09:00', horaFin: '18:00' });
      }
    }
    setForm((prev) => ({ ...prev, cantidadTurnos: cantidad, turnos: newTurnos }));
  };

  const handleTurnoTimeChange = (turnoNum: number, field: 'horaInicio' | 'horaFin', value: string) => {
    setForm((prev) => ({
      ...prev,
      turnos: prev.turnos.map((t) => (t.numero === turnoNum ? { ...t, [field]: value } : t)),
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
    sedeEmployees.forEach((emp) => {
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
        alert(`El turno ${turno.numero}: La hora de inicio debe ser menor que la hora de fin`);
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
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Crear Nuevo Horario</h3>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-4">Días de Trabajo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIAS_SEMANA.map((day) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.diasTrabajo.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hora de Apertura</label>
              <input
                type="time"
                value={form.horaApertura}
                onChange={(e) => setForm({ ...form, horaApertura: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Hora de Cierre</label>
              <input
                type="time"
                value={form.horaCierre}
                onChange={(e) => setForm({ ...form, horaCierre: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-3">Cantidad de Turnos</label>
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
            <div className="md:col-span-2 space-y-4">
              {form.turnos.map((turno) => (
                <div key={turno.numero} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-3">Turno {turno.numero}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-2">Hora de Inicio</label>
                      <input
                        type="time"
                        value={turno.horaInicio}
                        onChange={(e) => handleTurnoTimeChange(turno.numero, 'horaInicio', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-2">Hora de Fin</label>
                      <input
                        type="time"
                        value={turno.horaFin}
                        onChange={(e) => handleTurnoTimeChange(turno.numero, 'horaFin', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mes</label>
              <select
                value={form.mes}
                onChange={(e) => setForm({ ...form, mes: parseInt(e.target.value) })}
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
              <select
                value={form.anio}
                onChange={(e) => setForm({ ...form, anio: parseInt(e.target.value) })}
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

          <div className="mb-8">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Horas Requeridas Mensualmente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-green-50 p-4 rounded-lg border border-green-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tiempo Completo (horas/mes)</label>
                <input
                  type="number"
                  value={form.horasMensTC}
                  onChange={(e) => setForm({ ...form, horasMensTC: parseInt(e.target.value) || 160 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-slate-600 mt-1">Horas mensuales para empleados TC</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Medio Tiempo (horas/mes)</label>
                <input
                  type="number"
                  value={form.horasMensMT}
                  onChange={(e) => setForm({ ...form, horasMensMT: parseInt(e.target.value) || 80 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
                <p className="text-xs text-slate-600 mt-1">Horas mensuales para empleados MT</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (validateBasic()) setStep('assignments');
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Asignar Empleados</h3>
        <p className="text-slate-600 mb-6">Selecciona los empleados para este horario</p>

        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <button
            onClick={assignAllAsFullTime}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            Asignar todos como tiempo completo
          </button>
          <span className="text-sm text-slate-600">{assignedEmployees.size} empleados seleccionados</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Asignar</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Empleado</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Tipo de Jornada</th>
                {form.turnos.length > 1 && (
                  <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Turno</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sedeEmployees.map((emp) => {
                const assigned = assignedEmployees.get(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={!!assigned}
                        onChange={(e) => handleEmployeeAssignment(emp.id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{emp.nombreCompleto}</td>
                    <td className="px-6 py-4">
                      <select
                        value={assigned?.tipoJornada || 'tiempo_completo'}
                        onChange={(e) => handleEmployeeJornada(emp.id, e.target.value as any)}
                        disabled={!assigned}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      >
                        <option value="tiempo_completo">Tiempo completo</option>
                        <option value="medio_tiempo">Medio tiempo</option>
                        <option value="extra">Extra</option>
                      </select>
                    </td>
                    {form.turnos.length > 1 && (
                      <td className="px-6 py-4">
                        <select
                          value={assigned?.turno || 1}
                          onChange={(e) => handleEmployeeTurno(emp.id, parseInt(e.target.value))}
                          disabled={!assigned}
                          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
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
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-200">
        <button
          onClick={() => setStep('basic')}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
        >
          Volver
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          Guardar Horario
        </button>
      </div>
    </div>
  );
};

export default ScheduleForm;
