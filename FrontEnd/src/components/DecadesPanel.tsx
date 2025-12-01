import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MESES } from '../mocks/constants';
import { Employee, Schedule, Shift, WorkTimeConfig } from '../types/schedule';

interface Props {
  schedule: Schedule;
  employees: Employee[];
  onClose: () => void;
  getWorkTimeConfig?: (sede: string, anio: number) => WorkTimeConfig | undefined;
}

const DecadesPanel: React.FC<Props> = ({ schedule, employees, onClose, getWorkTimeConfig }) => {
  const [viewMonth, setViewMonth] = useState<number>(schedule.mes);
  const [viewYear, setViewYear] = useState<number>(schedule.anio);

  const assignmentsMap = useMemo(() => {
    const map = new Map<string, Schedule['empleadosAsignados'][number]>();
    schedule.empleadosAsignados.forEach((a) => map.set(a.employeeId, a));
    return map;
  }, [schedule.empleadosAsignados]);

  const workers = useMemo(
    () => employees.filter((e) => assignmentsMap.has(e.id)),
    [assignmentsMap, employees]
  );

  const monthDays = (m: number, y: number) => new Date(y, m, 0).getDate();

  const getDayName = (dateObj: Date) => {
    const names = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
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

  const computeDayWorked = (employeeId: string, day: number): number => {
    const assignment = assignmentsMap.get(employeeId);
    if (!assignment) return 0;
    const dateObj = new Date(viewYear, viewMonth - 1, day);
    const dayName = getDayName(dateObj);
    if (!schedule.diasTrabajo.includes(dayName)) return 0;

    let turnoObj: Shift | undefined;
    if (schedule.turnos.length === 1) {
      turnoObj = schedule.turnos[0];
    } else {
      const tnum = assignment.turno || 1;
      turnoObj = schedule.turnos.find((t) => t.numero === tnum);
    }

    const baseHours = shiftHours(turnoObj);
    if (assignment.tipoJornada === 'medio_tiempo') return baseHours / 2;
    if (assignment.tipoJornada === 'extra') return Math.min(4, baseHours);
    return baseHours;
  };

  const calculateTheoreticalHours = (employeeId: string, from: number, to: number): number => {
    const assignment = assignmentsMap.get(employeeId);
    if (!assignment) return 0;
    const cfg = getWorkTimeConfig ? getWorkTimeConfig(schedule.sede, viewYear) : undefined;
    const tcMonthly = schedule.horasMensTC ?? cfg?.horasMensTC ?? 160;
    const mtMonthly = schedule.horasMensMT ?? cfg?.horasMensMT ?? 80;
    const monthlyRequirement = assignment.tipoJornada === 'medio_tiempo' ? mtMonthly : tcMonthly;
    const workingDays = schedule.diasTrabajo.length * 4; // aproximación mensual
    const perDay = monthlyRequirement / Math.max(workingDays, 1);
    let total = 0;
    for (let d = from; d <= to; d++) {
      const dateObj = new Date(viewYear, viewMonth - 1, d);
      const dayName = getDayName(dateObj);
      if (schedule.diasTrabajo.includes(dayName)) total += perDay;
    }
    return total;
  };

  const computeTotals = () => {
    const days = monthDays(viewMonth, viewYear);
    return workers.map((worker) => {
      const horasTrabajadas = Array.from({ length: days }, (_, i) => i + 1)
        .map((d) => computeDayWorked(worker.id, d))
        .reduce((a, b) => a + b, 0);
      const teoricas = calculateTheoreticalHours(worker.id, 1, days);
      return {
        nombre: worker.nombreCompleto,
        tipo: worker.tipoContrato,
        horasTrabajadas,
        horasTeoricas: teoricas,
        saldo: teoricas - horasTrabajadas,
      };
    });
  };

  const totals = useMemo(computeTotals, [viewMonth, viewYear, assignmentsMap, workers]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Planilla ${schedule.nombre}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Mes: ${MESES[viewMonth - 1]} ${viewYear} • Sede: ${schedule.sede}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [['Empleado', 'Contrato', 'Horas trabajadas', 'Horas teóricas', 'Saldo']],
      body: totals.map((t) => [
        t.nombre,
        t.tipo.replace('_', ' '),
        t.horasTrabajadas.toFixed(2),
        t.horasTeoricas.toFixed(2),
        t.saldo.toFixed(2),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${schedule.nombre.replace(/\s+/g, '_')}_${viewMonth}_${viewYear}.pdf`);
  };

  const daysInMonth = monthDays(viewMonth, viewYear);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Planilla mensual</h2>
            <p className="text-slate-600">{schedule.nombre}</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900">Cerrar ✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mes</label>
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              {MESES.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
            <input
              type="number"
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value || String(schedule.anio)))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button onClick={downloadPDF} className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Descargar PDF
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
          <p>
            Días del mes: <strong>{daysInMonth}</strong> • Jornadas activas: {schedule.diasTrabajo.join(', ')}
          </p>
          <p className="mt-1">Las horas teóricas se calculan con el requerimiento mensual configurado dividido en días laborables.</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Empleado</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Contrato</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Horas trabajadas</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Horas teóricas</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {totals.map((row) => (
                <tr key={row.nombre} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.nombre}</td>
                  <td className="px-4 py-3 capitalize">{row.tipo.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{row.horasTrabajadas.toFixed(2)}</td>
                  <td className="px-4 py-3">{row.horasTeoricas.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-semibold ${row.saldo >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {row.saldo.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DecadesPanel;
