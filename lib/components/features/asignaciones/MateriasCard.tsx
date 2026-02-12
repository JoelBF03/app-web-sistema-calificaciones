'use client';

import { BookOpen, Settings, AlertCircle, CheckCircle, X } from 'lucide-react';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';

import { Materia } from '@/lib/types/materia.types';

interface ColorScheme {
  badge: string;
  card: string;
  button: string;
  info: string;
}

interface MateriasCardProps {
  materia: Materia;
  totalParalelos: number;
  asignados: number;
  colors: ColorScheme;
  esBasica: boolean;
  onConfigurar: (materia: Materia) => void;
  onEliminar: (materia: Materia) => void;
}

export function MateriasCard({
  materia,
  totalParalelos,
  asignados,
  colors,
  esBasica,
  onConfigurar,
  onEliminar,
}: MateriasCardProps) {
  const pendientes = totalParalelos - asignados;

  const getBadgeEstado = () => {
    if (asignados === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Sin asignar
        </Badge>
      );
    }
    if (asignados === totalParalelos) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-green-200" />
          Completo
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1 text-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Parcial
      </Badge>
    );
  };

  return (
    <Card className={`${colors.card} border-2 hover:shadow-md transition-all relative group`}>
      <CardContent className="p-4">
        {!esBasica && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              onEliminar(materia);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-start justify-between mb-3 pr-6">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <h3 className="font-bold text-base text-gray-900 line-clamp-1">{materia.nombre}</h3>
          </div>
          {getBadgeEstado()}
        </div>

        <div className="space-y-1.5 mb-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Paralelos:</span>
            <span className="font-semibold text-gray-900">{totalParalelos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Asignados:</span>
            <span className="font-semibold text-green-600">
              {asignados}/{totalParalelos}
            </span>
          </div>
          {pendientes > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pendientes:</span>
              <span className="font-semibold text-amber-600">{pendientes}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-dashed flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            {asignados === totalParalelos ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                <span>Completo</span>
              </>
            ) : asignados > 0 ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <span>Incompleto</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                <span>Sin configurar</span>
              </>
            )}
          </div>
          <Button
            size="sm"
            className={`${colors.button} h-8 text-xs`}
            onClick={(e) => {
              e.stopPropagation();
              onConfigurar(materia);
            }}
          >
            <Settings className="h-3 w-3 mr-1" />
            Configurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}