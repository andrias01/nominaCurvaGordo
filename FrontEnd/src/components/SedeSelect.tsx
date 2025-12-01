import React from 'react';
import { SEDES } from '../mocks/constants';

interface Props {
  onSelect: (sede: string) => void;
}

const SedeSelect: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="flex justify-center mb-12">
          <div className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-slate-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-700">🍽️</div>
              <div className="text-sm font-semibold text-slate-600 mt-2">LA CURVA DEL GORDO</div>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Gestor de Horarios</h1>
          <p className="text-lg text-slate-600">¿De qué sede desea configurar el horario?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEDES.map((sede) => (
            <button
              key={sede}
              onClick={() => onSelect(sede)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 cursor-pointer group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏪</div>
              <h2 className="text-xl font-semibold text-slate-700 group-hover:text-blue-600">{sede}</h2>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SedeSelect;
