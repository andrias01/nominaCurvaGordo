import React, { useMemo, useState } from 'react';
import { Employee } from '../types/schedule';

interface Props {
  sede: string;
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

const EmployeesTab: React.FC<Props> = ({
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

  const sedeEmployees = useMemo(
    () => employees.filter((e) => e.sede === sede),
    [employees, sede]
  );

  const filteredEmployees = useMemo(() => {
    return sedeEmployees.filter((e) => {
      const matchesSearch = e.nombreCompleto
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter = !filterTipo || e.tipoContrato === filterTipo;
      return matchesSearch && matchesFilter;
    });
  }, [filterTipo, searchTerm, sedeEmployees]);

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
      setFormData({ nombreCompleto: '', tipoContrato: 'tiempo_completo', rol: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nombreCompleto.trim() || !formData.rol.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (editingId) {
      onEditEmployee({ id: editingId, ...formData, activo: true, sede });
    } else {
      onAddEmployee({ id: crypto.randomUUID(), ...formData, activo: true, sede });
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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p className="text-lg">No hay empleados para esta búsqueda</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Nombre</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Tipo de Contrato</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-700 text-sm">Rol</th>
                <th className="text-center px-6 py-3 font-semibold text-slate-700 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800 font-medium">{emp.nombreCompleto}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTipoContratoBadgeColor(emp.tipoContrato)}`}>
                      {getTipoContratoLabel(emp.tipoContrato)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{emp.rol}</td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button onClick={() => handleOpenModal(emp)} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                      Editar
                    </button>
                    <button onClick={() => onDeleteEmployee(emp.id)} className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">{editingId ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Contrato</label>
              <select
                value={formData.tipoContrato}
                onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="tiempo_completo">Tiempo Completo</option>
                <option value="medio_tiempo">Medio Tiempo</option>
                <option value="extra">Extra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
              <input
                type="text"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
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

export default EmployeesTab;
