import React, { useEffect, useMemo, useState } from 'react';
import DecadesPanel from './DecadesPanel';
import EmployeesTab from './EmployeesTab';
import ScheduleDetails from './ScheduleDetails';
import ScheduleForm from './ScheduleForm';
import SedeSelect from './SedeSelect';
import WorkTimeConfigPanel from './WorkTimeConfigPanel';
import { MESES } from '../mocks/constants';
import { scheduleService } from '../services/scheduleService';
import { Employee, Schedule, WorkTimeConfig } from '../types/schedule';

const ScheduleManager: React.FC = () => {
  const [selectedSede, setSelectedSede] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'empleados' | 'horarios' | 'tiempo'>('empleados');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [showDecades, setShowDecades] = useState(false);
  const [workTimeConfigs, setWorkTimeConfigs] = useState<WorkTimeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const getWorkTimeConfig = (sede: string, anio: number) => workTimeConfigs.find((c) => c.sede === sede && c.anio === anio);

  useEffect(() => {
    if (!selectedSede) return;
    const load = async () => {
      setLoading(true);
      const [emp, sch] = await Promise.all([
        scheduleService.fetchEmployeesBySede(selectedSede),
        scheduleService.fetchSchedulesBySede(selectedSede),
      ]);
      setEmployees(emp);
      setSchedules(sch);
      setSelectedScheduleId(sch[0]?.id || null);
      setLoading(false);
    };
    load();
  }, [selectedSede]);

  const selectedSchedule = useMemo(
    () => schedules.find((s) => s.id === selectedScheduleId) || null,
    [schedules, selectedScheduleId]
  );

  const handleSaveSchedule = async (schedule: Schedule) => {
    const saved = await scheduleService.saveSchedule(schedule);
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) return prev.map((s) => (s.id === saved.id ? saved : s));
      return [...prev, saved];
    });
    setSelectedScheduleId(saved.id);
    setCreating(false);
    setActiveTab('horarios');
  };

  const handleDeleteSchedule = async (id: string) => {
    await scheduleService.deleteSchedule(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setSelectedScheduleId((prev) => (prev === id ? null : prev));
  };

  const handleSaveEmployee = async (employee: Employee, isEdit = false) => {
    const saved = await scheduleService.saveEmployee(employee);
    setEmployees((prev) => {
      if (isEdit) return prev.map((e) => (e.id === saved.id ? saved : e));
      return [...prev, saved];
    });
  };

  const handleDeleteEmployee = async (id: string) => {
    await scheduleService.deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSaveWorkTime = async (config: WorkTimeConfig) => {
    const saved = await scheduleService.saveWorkTimeConfig(config);
    setWorkTimeConfigs((prev) => {
      const exists = prev.some((c) => c.sede === saved.sede && c.anio === saved.anio);
      if (exists) return prev.map((c) => (c.sede === saved.sede && c.anio === saved.anio ? saved : c));
      return [...prev, saved];
    });
  };

  if (!selectedSede) {
    return <SedeSelect onSelect={setSelectedSede} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
              <div className="text-2xl">🍽️</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">La Curva Del Gordo</h1>
              <p className="text-slate-600 text-sm">Gestión de Horarios • {selectedSede}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedSede(null);
              setSchedules([]);
              setEmployees([]);
            }}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            ← Cambiar Sede
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex overflow-hidden">
          {(['empleados', 'horarios', 'tiempo'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-4 text-center font-semibold transition-colors ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab === 'empleados' && 'Empleados'}
              {tab === 'horarios' && 'Horarios'}
              {tab === 'tiempo' && 'Config. mensual'}
            </button>
          ))}
        </div>

        {loading && <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">Cargando datos...</div>}

        {!loading && activeTab === 'empleados' && (
          <EmployeesTab
            sede={selectedSede}
            employees={employees}
            onAddEmployee={(emp) => handleSaveEmployee(emp)}
            onEditEmployee={(emp) => handleSaveEmployee(emp, true)}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {!loading && activeTab === 'horarios' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear horario
              </button>
              {selectedSchedule && (
                <button
                  onClick={() => setShowDecades(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Ver planilla PDF
                </button>
              )}
            </div>

            {schedules.length === 0 && !creating && (
              <div className="bg-white rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
                No hay horarios para esta sede. Crea uno nuevo para comenzar.
              </div>
            )}

            {creating && (
              <ScheduleForm
                sede={selectedSede}
                employees={employees}
                onSave={handleSaveSchedule}
                onCancel={() => setCreating(false)}
                getWorkTimeConfig={getWorkTimeConfig}
              />
            )}

            {!creating && selectedSchedule && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1 space-y-2">
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 font-semibold text-slate-700">Horarios creados</div>
                    <ul className="divide-y divide-slate-200">
                      {schedules.map((schedule) => (
                        <li key={schedule.id}>
                          <button
                            onClick={() => setSelectedScheduleId(schedule.id)}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                              selectedScheduleId === schedule.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-800'
                            }`}
                          >
                            <div>{schedule.nombre}</div>
                            <p className="text-xs text-slate-500">
                              {MESES[schedule.mes - 1]} {schedule.anio} • {schedule.diasTrabajo.length} días activos
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <ScheduleDetails
                    schedule={selectedSchedule}
                    employees={employees}
                    onEdit={() => setCreating(true)}
                    onDelete={() => handleDeleteSchedule(selectedSchedule.id)}
                    onOpenDecades={() => setShowDecades(true)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'tiempo' && (
          <WorkTimeConfigPanel sede={selectedSede} configs={workTimeConfigs} onSave={handleSaveWorkTime} />
        )}
      </main>

      {showDecades && selectedSchedule && (
        <DecadesPanel
          schedule={selectedSchedule}
          employees={employees}
          onClose={() => setShowDecades(false)}
          getWorkTimeConfig={getWorkTimeConfig}
        />
      )}
    </div>
  );
};

export default ScheduleManager;
