'use client';

import { Button } from '@/lib/components/ui/button';
import { Calendar, CheckCircle2, Clock, Lock, BookCheck } from 'lucide-react';
import { TrimestreEstado, EstadoPeriodo, EstadoSupletorio } from '@/lib/types';

interface TrimestreSelectorProps {
  trimestres: Array<{
    id: string;
    nombre: string;
    numero: number;
    estado: TrimestreEstado;
  }>;
  trimestreSeleccionado: string | null;
  onSeleccionar: (trimestreId: string) => void;
  estadoPeriodo?: EstadoPeriodo;
  estadoSupletorio?: EstadoSupletorio;
}

// 🆕 ID especial para identificar cuando se selecciona supletorios
export const SUPLETORIO_ID = 'SUPLETORIOS';

export function TrimestreSelector({ 
  trimestres, 
  trimestreSeleccionado, 
  onSeleccionar,
  estadoPeriodo,
  estadoSupletorio
}: TrimestreSelectorProps) {
  const supletoriosActivos = estadoSupletorio === EstadoSupletorio.ACTIVADO;
  const supletoriosCerrados = estadoSupletorio === EstadoSupletorio.CERRADO;
  const enSupletorios = supletoriosActivos || supletoriosCerrados;

  return (
    <div className="space-y-3">
      {/* Banner de estado de supletorios */}
      {enSupletorios && (
        <div className={`p-3 rounded-lg border-2 ${
          supletoriosCerrados 
            ? 'bg-gray-50 border-gray-300' 
            : 'bg-orange-50 border-orange-300'
        }`}>
          <div className="flex items-center gap-2">
            {supletoriosCerrados ? (
              <Lock className="h-5 w-5 text-gray-600" />
            ) : (
              <BookCheck className="h-5 w-5 text-orange-600" />
            )}
            <span className={`font-semibold ${
              supletoriosCerrados ? 'text-gray-700' : 'text-orange-700'
            }`}>
              {supletoriosCerrados 
                ? 'Período de supletorios cerrado' 
                : 'Período de supletorios activo'}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Trimestres normales */}
        {trimestres.map((trimestre) => {
          const Icon = trimestre.estado === TrimestreEstado.FINALIZADO 
            ? CheckCircle2 
            : trimestre.estado === TrimestreEstado.ACTIVO 
            ? Clock 
            : Calendar;

          const isSelected = trimestreSeleccionado === trimestre.id;

          return (
            <Button
              key={trimestre.id}
              onClick={() => onSeleccionar(trimestre.id)}
              variant={isSelected ? "default" : "outline"}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-red-600 shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-gray-400 hover:border-red-600 hover:text-red-600 hover:shadow-md hover:bg-white'
              }`}
            >
              <Icon className={`h-4 w-4 mr-2 ${
                isSelected ? 'text-white' : 'text-gray-500'
              }`} />
              {trimestre.nombre}
              {trimestre.estado === TrimestreEstado.ACTIVO && !enSupletorios && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-white/20'
                    : 'bg-green-100 text-green-700'
                }`}>
                  Activo
                </span>
              )}
              {trimestre.estado === TrimestreEstado.FINALIZADO && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isSelected
                    ? 'bg-white/20'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  Finalizado
                </span>
              )}
            </Button>
          );
        })}

        {/* 🆕 BOTÓN DE SUPLETORIOS - Solo aparece cuando están activos o cerrados */}
        {enSupletorios && (
          <Button
            onClick={() => onSeleccionar(SUPLETORIO_ID)}
            variant={trimestreSeleccionado === SUPLETORIO_ID ? "default" : "outline"}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 cursor-pointer ${
              trimestreSeleccionado === SUPLETORIO_ID
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white border-orange-600 shadow-lg scale-105'
                : 'bg-white text-orange-700 border-orange-400 hover:border-orange-600 hover:text-orange-800 hover:shadow-md hover:bg-orange-50'
            }`}
          >
            <BookCheck className={`h-4 w-4 mr-2 ${
              trimestreSeleccionado === SUPLETORIO_ID ? 'text-white' : 'text-orange-600'
            }`} />
            SUPLETORIOS
            {supletoriosActivos && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                trimestreSeleccionado === SUPLETORIO_ID
                  ? 'bg-white/20'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                Activo
              </span>
            )}
            {supletoriosCerrados && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                trimestreSeleccionado === SUPLETORIO_ID
                  ? 'bg-white/20'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                Cerrado
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}