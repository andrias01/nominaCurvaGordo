import React from 'react';
import { Schedule, Employee } from '../types/schedule';

interface Props {
  schedule: Schedule;
  employees: Employee[];
  onEdit: () => void;
  onDelete: () => void;
  onOpenDecades: () => void;
}

const ScheduleDetails: React.FC<Props> = ({ schedule, employees, onEdit, onDelete, onOpenDecades }) => {
  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.nombreCompleto || 'Empleado';

  const getTipoJornadaBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      tiempo_completo: 'bg-green-100 text-green-800',
      medio_tiempo: 'bg-blue-100 text-blue-800',
      extra: 'bg-orange-100 text-orange-800',
    };
    return colors[tipo] || 'bg-slate-100 text-slate-800';
  };

  const getTipoJornadaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      tiempo_completo: 'Tiempo Completo',
      medio_tiempo: 'Medio Tiempo',
      extra: 'Extra',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{schedule.nombre}</h2>
          <p className="text-slate-600">{schedule.diasTrabajo.join(', ')} • Turnos: {schedule.turnos.length}</p>
          <p className="text-slate-600">{schedule.empleadosAsignados.length} empleados asignados</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Editar</button>
          <button onClick={onOpenDecades} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Ver planilla mensual</button>
          <button onClick={onDelete} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Eliminar</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Turnos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedule.turnos.map((turno) => (
            <div key={turno.numero} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="font-semibold text-slate-700 mb-2">Turno {turno.numero}</h4>
              <p className="text-slate-800 font-medium">
                {turno.horaInicio} - {turno.horaFin}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Empleados Asignados</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Empleado</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Tipo de Jornada</th>
                {schedule.turnos.length > 1 && (
                  <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Turno</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {schedule.empleadosAsignados.map((assignment) => (
                <tr key={assignment.employeeId} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{getEmployeeName(assignment.employeeId)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTipoJornadaBadgeColor(assignment.tipoJornada)}`}>
                      {getTipoJornadaLabel(assignment.tipoJornada)}
                    </span>
                  </td>
                  {schedule.turnos.length > 1 && (
                    <td className="px-6 py-4 text-slate-800">Turno {assignment.turno}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;
