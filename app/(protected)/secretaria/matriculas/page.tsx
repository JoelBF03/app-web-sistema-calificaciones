'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMatriculas } from '@/lib/hooks/useMatriculas';
import { FiltrosMatriculas } from '@/lib/components/features/matriculas/FiltrosMatriculas';
import { TablaMatriculas } from '@/lib/components/features/matriculas/TablaMatriculas';
import { EstadisticasMatriculas } from '@/lib/components/features/matriculas/EstadisticasMatriculas';

export default function SecretariaMatriculasPage() {
  const { matriculas, loading, error, fetchMatriculas } = useMatriculas();
  const [filtros, setFiltros] = useState({
    periodoId: '',
    cursoId: '',
    busqueda: ''
  });

  useEffect(() => {
    fetchMatriculas();
  }, [fetchMatriculas]);

  const matriculasFiltradas = matriculas.filter(m => {
    // Lógica de filtrado
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center gap-4">
          <Link
            href="/secretaria"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Matrículas</h1>
            <p className="text-gray-600">Administra las matrículas</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasMatriculas matriculas={matriculas} />

      {/* Filtros */}
      <FiltrosMatriculas filtros={filtros} onChange={setFiltros} />

      {/* Tabla */}
      <TablaMatriculas
        matriculas={matriculasFiltradas}
        loading={loading}
        error={error}
      />
    </div>
  );
}