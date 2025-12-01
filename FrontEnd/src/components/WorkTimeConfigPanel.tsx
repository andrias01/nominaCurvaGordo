import React, { useMemo, useState } from 'react';
import { WorkTimeConfig } from '../types/schedule';

interface Props {
  sede: string;
  configs: WorkTimeConfig[];
  onSave: (config: WorkTimeConfig) => void;
}

const WorkTimeConfigPanel: React.FC<Props> = ({ sede, configs, onSave }) => {
  const currentYear = new Date().getFullYear();
  const sedeConfigs = useMemo(() => configs.filter((c) => c.sede === sede), [configs, sede]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [horasTC, setHorasTC] = useState<number>(160);
  const [horasMT, setHorasMT] = useState<number>(80);

  const handleSave = () => {
    onSave({ sede, anio: selectedYear, horasMensTC: horasTC, horasMensMT: horasMT });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Sede</label>
            <input
              type="text"
              value={sede}
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Año</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value || `${currentYear}`))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Guardar configuración
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Tiempo Completo (horas/mes)</label>
            <input
              type="number"
              value={horasTC}
              onChange={(e) => setHorasTC(parseInt(e.target.value || '160'))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <label className="block text-sm font-medium text-slate-700 mb-2">Medio Tiempo (horas/mes)</label>
            <input
              type="number"
              value={horasMT}
              onChange={(e) => setHorasMT(parseInt(e.target.value || '80'))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <h4 className="font-semibold text-slate-800 mb-3">Configuraciones existentes</h4>
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
                    <button
                      onClick={() => {
                        setSelectedYear(c.anio);
                        setHorasTC(c.horasMensTC);
                        setHorasMT(c.horasMensMT);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
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

export default WorkTimeConfigPanel;
