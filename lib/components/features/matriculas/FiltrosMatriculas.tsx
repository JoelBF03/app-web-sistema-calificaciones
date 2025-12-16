'use client';

import { useState, useEffect } from 'react';
import { periodosService } from '@/lib/services/periodos';
import { cursosService } from '@/lib/services/cursos';

interface FiltrosMatriculasProps {
  filtros: {
    periodoId: string;
    cursoId: string;
    busqueda: string;
  };
  onChange: (filtros: any) => void;
  onFiltrar: () => void;
  onMatricularManual: () => void;
  onImportarExcel: () => void;
}

export function FiltrosMatriculas({
  filtros,
  onChange,
  onFiltrar,
  onMatricularManual,
  onImportarExcel
}: FiltrosMatriculasProps) {
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Cargar períodos
    periodosService.getAll().then(setPeriodos).catch(console.error);
    // Cargar cursos
    cursosService.findAll().then(setCursos).catch(console.error);
  }, []);

  const handleChange = (field: string, value: string) => {
    onChange({ ...filtros, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Período Lectivo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <i className="fas fa-calendar-alt text-blue-600 mr-2"></i>
            Período Lectivo *
          </label>
          <select
            value={filtros.periodoId}
            onChange={(e) => handleChange('periodoId', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccione...</option>
            {periodos.map((periodo) => (
              <option key={periodo.id} value={periodo.id}>
                {periodo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Curso */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <i className="fas fa-chalkboard text-purple-600 mr-2"></i>
            Curso *
          </label>
          <select
            value={filtros.cursoId}
            onChange={(e) => handleChange('cursoId', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccione...</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.nivel} {curso.paralelo} - {curso.especialidad}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <i className="fas fa-search text-green-600 mr-2"></i>
            Buscar (opcional)
          </label>
          <div className="relative">
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => handleChange('busqueda', e.target.value)}
              placeholder="Cédula o nombre..."
              className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>

        {/* Botón Filtrar */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 invisible">
            Filtrar
          </label>
          <button
            onClick={onFiltrar}
            className="w-full cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-filter mr-2"></i>
            Filtrar
          </button>
        </div>

        {/* Botón Matricular (Dropdown) */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2 invisible">
            Matricular
          </label>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fas fa-user-plus"></i>
            Matricular
            <i className={`fas fa-chevron-down text-xs transition-transform ${showDropdown ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
              <button
                onClick={() => {
                  onMatricularManual();
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100"
              >
                <i className="fas fa-keyboard text-green-600"></i>
                <span className="font-medium">Matrícula Manual</span>
              </button>
              <button
                onClick={() => {
                  onImportarExcel();
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
              >
                <i className="fas fa-file-excel text-blue-600"></i>
                <span className="font-medium">Importar desde Excel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}