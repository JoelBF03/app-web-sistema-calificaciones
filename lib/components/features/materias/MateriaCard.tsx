'use client';

import {
  EstadoMateria,
  Materia,
  NivelEducativoLabels,
  TrimestreAplicableLabels
} from '@/lib/types/materia.types';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import {
  BookOpen,
  Edit,
  ToggleLeft,
  ToggleRight,
  Circle
} from 'lucide-react';

interface MateriaCardProps {
  materia: Materia;
  onEdit: (materia: Materia) => void;
  onToggleEstado: (materia: Materia) => void;
}

export default function MateriaCard({
  materia,
  onEdit,
  onToggleEstado,
}: MateriaCardProps) {
  const isActivo = materia.estado === EstadoMateria.ACTIVO;

  return (
    <Card
      className={[
        'transition-all',
        'hover:shadow-md',
        'border',
        isActivo ? 'bg-white' : 'bg-gray-50 border-dashed'
      ].join(' ')}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          
          {/* INFO */}
          <div className="flex gap-4 min-w-0">
            {/* Icon */}
            <div
              className={[
                'h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0',
                isActivo ? 'bg-blue-50' : 'bg-gray-100'
              ].join(' ')}
            >
              <BookOpen
                className={[
                  'w-6 h-6',
                  isActivo ? 'text-blue-600' : 'text-gray-400'
                ].join(' ')}
              />
            </div>

            {/* Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold truncate">
                  {materia.nombre}
                </h3>

                {/* Estado visual */}
                <Badge
                  variant="outline"
                  className={[
                    'flex items-center gap-1 text-xs',
                    isActivo
                      ? 'border-green-300 text-green-700'
                      : 'border-gray-300 text-gray-500'
                  ].join(' ')}
                >
                  <Circle
                    className={`w-2.5 h-2.5 ${
                      isActivo ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                    }`}
                  />
                  {isActivo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="mt-1 text-sm text-gray-600 space-y-0.5">
                <p>
                  <span className="font-medium text-gray-700">Nivel:</span>{' '}
                  {NivelEducativoLabels[materia.nivelEducativo]}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Trimestre:</span>{' '}
                  {TrimestreAplicableLabels[materia.trimestreAplicable]}
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(materia)}
              className="gap-1"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>

            <Button
              size="sm"
              variant={isActivo ? 'outline' : 'default'}
              onClick={() => onToggleEstado(materia)}
              className="gap-1"
            >
              {isActivo ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  Activar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
