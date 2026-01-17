'use client';

import { Button } from '@/lib/components/ui/button';
import { TrimestreEstado } from '@/lib/types';

interface TrimestreSelectorProps {
  trimestres: Array<{
    id: string;
    nombre: string;
    numero: number;
    estado: TrimestreEstado;
  }>;
  trimestreSeleccionado: string | null;
  onSeleccionar: (trimestreId: string) => void;
}

export function TrimestreSelector({ 
  trimestres, 
  trimestreSeleccionado, 
  onSeleccionar 
}: TrimestreSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {trimestres.map((trimestre) => (
        <Button
          key={trimestre.id}
          onClick={() => onSeleccionar(trimestre.id)}
          variant={trimestreSeleccionado === trimestre.id ? "default" : "outline"}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 cursor-pointer ${
            trimestreSeleccionado === trimestre.id
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-600 shadow-lg scale-105'
              : 'bg-white text-gray-700 border-gray-400 hover:border-red-600 hover:text-red-600 hover:shadow-md hover:bg-white'
          }`}
        >
          {trimestre.nombre}
          {trimestre.estado === TrimestreEstado.ACTIVO && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
              trimestreSeleccionado === trimestre.id
                ? 'bg-white/20'
                : 'bg-green-100 text-green-700'
            }`}>
              Activo
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}