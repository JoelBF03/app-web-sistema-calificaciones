'use client';

import { Target, BookOpen, FileText } from 'lucide-react';

export type TipoTutoriaTab = 'proyecto' | 'componentes' | 'reportes';

interface TutoriaTabsProps {
  tipoActivo: TipoTutoriaTab;
  onCambiar: (tipo: TipoTutoriaTab) => void;
}

export function TutoriaTabs({ tipoActivo, onCambiar }: TutoriaTabsProps) {
  const tabs = [
    { 
      value: 'proyecto' as const, 
      label: 'Proyecto Integrador', 
      icon: Target,
      descripcion: 'Calificación del proyecto trimestral'
    },
    { 
      value: 'componentes' as const, 
      label: 'Componentes Secundarios', 
      icon: BookOpen,
      descripcion: 'Comportamiento, OVP, Tutoría, Animación Lectora'
    },
    { 
      value: 'reportes' as const, 
      label: 'Reportes Individuales', 
      icon: FileText,
      descripcion: 'Libretas trimestrales del curso'
    },
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
            className={`flex items-center gap-3 px-6 py-4 font-semibold border-b-4 transition-all duration-200 whitespace-nowrap cursor-pointer ${
              isActive
                ? 'border-yellow-500 text-yellow-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-yellow-600 hover:bg-white/50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <div className="text-left">
              <div>{tab.label}</div>
              <div className="text-xs font-normal text-gray-500">
                {tab.descripcion}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}