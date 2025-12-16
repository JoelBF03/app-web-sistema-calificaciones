'use client';

import { UserPlus, Users } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNew: () => void;
}

export default function EmptyState({ hasFilters, onCreateNew }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
      <div className="flex justify-center mb-4">
        <Users className="w-20 h-20 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No se encontraron docentes
      </h3>
      
      <p className="text-gray-600 mb-6">
        {hasFilters
          ? 'No hay docentes que coincidan con los filtros aplicados.'
          : 'Aún no hay docentes registrados en el sistema.'
        }
      </p>
      
      <button
        onClick={onCreateNew}
        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium inline-flex items-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        Registrar Primer Docente
      </button>
    </div>
  );
}