'use client';

import { useState } from 'react';
import { Card } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import { Power, PowerOff, Eye, Edit2, BookOpen, Wrench, Calculator, AlertTriangle } from 'lucide-react';
import { Curso, EstadoCurso, NIVEL_DISPLAY_MAP } from '@/lib/types/curso.types';

interface CursosCompactViewProps {
  cursos: Curso[];
  onToggleEstado: (curso: Curso) => void;
  onViewDetails?: (curso: Curso) => void;
  onEdit?: (curso: Curso) => void;
}

export default function CursosCompactView({ cursos, onToggleEstado, onViewDetails, onEdit }: CursosCompactViewProps) {
  const [cursoToToggle, setCursoToToggle] = useState<Curso | null>(null);

  const getEspecialidadConfig = (especialidad: string) => {
    switch (especialidad) {
      case 'BASICA': 
        return {
          color: 'bg-purple-100 text-purple-700 border-purple-300',
          icon: <BookOpen className="w-4 h-4" />
        };
      case 'TECNICO': 
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-300',
          icon: <Wrench className="w-4 h-4" />
        };
      case 'CIENCIAS': 
        return {
          color: 'bg-green-100 text-green-700 border-green-300',
          icon: <Calculator className="w-4 h-4" />
        };
      default: 
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: <BookOpen className="w-4 h-4" />
        };
    }
  };

  const handleConfirmToggle = () => {
    if (cursoToToggle) {
      onToggleEstado(cursoToToggle);
      setCursoToToggle(null);
    }
  };

  return (
    <>
      <Card className="divide-y">
        {cursos.map((curso) => {
          const isActive = curso.estado === EstadoCurso.ACTIVO;
          const config = getEspecialidadConfig(curso.especialidad);
          
          return (
            <div 
              key={curso.id} 
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                !isActive && 'opacity-60'
              }`}
            >
              {/* Indicador de estado */}
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                isActive ? 'bg-green-500' : 'bg-red-500'
              } ${isActive && 'animate-pulse'} shadow-md`}></div>

              {/* Icono de especialidad */}
              <div className={`p-2 rounded-lg border ${config.color} flex-shrink-0`}>
                {config.icon}
              </div>

              {/* Nivel */}
              <div className="min-w-[160px]">
                <div className="font-bold text-sm text-gray-900">
                  {NIVEL_DISPLAY_MAP[curso.nivel]}
                </div>
                <div className="text-xs text-gray-500">
                  {curso.periodo_lectivo.nombre}
                </div>
              </div>

              {/* Paralelo */}
              <Badge variant="outline" className="font-black text-xl px-4 py-1 flex-shrink-0">
                {curso.paralelo}
              </Badge>

              {/* Especialidad */}
              <Badge variant="outline" className={`${config.color} text-sm font-medium px-3 py-1 flex-shrink-0`}>
                {curso.especialidad}
              </Badge>

              <Badge variant="outline" className={` bg-yellow-100 text-black-700 border-yellow-300 text-sm font-medium px-3 py-1 flex-shrink-0`}>
                {curso.docente ? `${curso.docente.nombres} ${curso.docente.apellidos}` : 'Sin tutor'}
              </Badge>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Acciones */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => onViewDetails?.(curso)}

                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => onEdit?.(curso)}
                >
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  Editar
                </Button>
                <Button
                  variant={isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => setCursoToToggle(curso)}
                  className="h-9 min-w-[110px]"
                >
                  {isActive ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-1.5" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-1.5" />
                      Activar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Modal de Confirmación */}
      {cursoToToggle && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar cambio de estado</h3>
            </div>
            <p className="text-gray-700 mb-6">
              {cursoToToggle.estado === EstadoCurso.ACTIVO ? (
                <>
                  ¿Estás seguro de que deseas <strong>desactivar</strong> el curso{' '}
                  <strong>{NIVEL_DISPLAY_MAP[cursoToToggle.nivel]} - {cursoToToggle.paralelo}</strong>?
                </>
              ) : (
                <>
                  ¿Estás seguro de que deseas <strong>activar</strong> el curso{' '}
                  <strong>{NIVEL_DISPLAY_MAP[cursoToToggle.nivel]} - {cursoToToggle.paralelo}</strong>?
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCursoToToggle(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  cursoToToggle.estado === EstadoCurso.ACTIVO
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {cursoToToggle.estado === EstadoCurso.ACTIVO ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}