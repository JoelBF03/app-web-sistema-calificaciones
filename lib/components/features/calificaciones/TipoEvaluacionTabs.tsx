// nextjs-frontend/lib/components/features/calificaciones/TipoEvaluacionTabs.tsx
'use client';

import { BookOpen, Calculator, FileText, GraduationCap } from 'lucide-react';

export type TipoEvaluacion = 'insumos' | 'proyecto' | 'examen' | 'promedio';

interface TipoEvaluacionTabsProps {
  tipoActivo: TipoEvaluacion;
  onCambiar: (tipo: TipoEvaluacion) => void;
  porcentajes: {
    insumos: number;
    proyecto: number;
    examen: number;
  };
}

export function TipoEvaluacionTabs({ tipoActivo, onCambiar, porcentajes }: TipoEvaluacionTabsProps) {
  const tabs = [
    { value: 'insumos' as const, label: 'Insumos', icon: BookOpen, porcentaje: porcentajes.insumos },
    { value: 'proyecto' as const, label: 'Proyecto', icon: FileText, porcentaje: porcentajes.proyecto },
    { value: 'examen' as const, label: 'Examen', icon: GraduationCap, porcentaje: porcentajes.examen },
    { value: 'promedio' as const, label: 'Promedio Trimestral', icon: Calculator, porcentaje: 100 },
  ];

  return (
    <div className="flex overflow-x-auto gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tipoActivo === tab.value;
        
        return (
          <button
            key={tab.value}
            onClick={() => onCambiar(tab.value)}
            className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-all duration-200 whitespace-nowrap cursor-pointer ${
              isActive
                ? tab.value === 'promedio'
                  ? 'border-purple-600 text-purple-600 bg-white'
                  : 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-red-600 hover:bg-white/50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {tab.porcentaje}%
            </span>
          </button>
        );
      })}
    </div>
  );
}