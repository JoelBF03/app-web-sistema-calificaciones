'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { 
  Edit2, 
  Eye,
  Power,
  PowerOff,
  BookOpen,
  Wrench,
  Calculator,
  AlertTriangle
} from 'lucide-react';
import { Curso, EstadoCurso, EspecialidadCurso, NIVEL_DISPLAY_MAP } from '@/lib/types/curso.types';

interface CursoCardProps {
  curso: Curso;
  onEdit?: (curso: Curso) => void;
  onViewDetails?: (curso: Curso) => void;
  onToggleEstado?: (curso: Curso) => void;
}

export default function CursoCard({ 
  curso, 
  onEdit, 
  onViewDetails, 
  onToggleEstado
}: CursoCardProps) {
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isActive = curso.estado === EstadoCurso.ACTIVO;

  const getEspecialidadConfig = (especialidad: EspecialidadCurso) => {
    switch (especialidad) {
      case EspecialidadCurso.BASICA:
        return {
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-300',
          icon: <BookOpen className="w-4 h-4" />
        };
      case EspecialidadCurso.TECNICO:
        return {
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300',
          icon: <Wrench className="w-4 h-4" />
        };
      case EspecialidadCurso.CIENCIAS:
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-300',
          icon: <Calculator className="w-4 h-4" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
          icon: <BookOpen className="w-4 h-4" />
        };
    }
  };

  const config = getEspecialidadConfig(curso.especialidad);

  const handleConfirmToggle = () => {
    onToggleEstado?.(curso);
    setShowConfirmModal(false);
  };

  return (
    <>
      <Card className={`relative hover:shadow-md transition-all duration-200 border-2 ${
        isActive ? config.borderColor : 'border-gray-200'
      } ${!isActive && 'opacity-60'}`}>
        
        <div className="absolute top-2 right-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            isActive ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'
          } shadow-md ${isActive && 'animate-pulse'}`}></div>
        </div>

        <CardContent className="p-3 space-y-2">
          
          <div className="flex items-center gap-2">
            <div className={`${config.bgColor} p-1.5 rounded ${config.borderColor} border`}>
              <div className={config.textColor}>
                {config.icon}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-gray-900 leading-tight truncate">
                {NIVEL_DISPLAY_MAP[curso.nivel]}
              </h3>
            </div>

            <div className={`${config.bgColor} border ${config.borderColor} rounded-lg px-3 py-1`}>
              <span className={`text-2xl font-black ${config.textColor}`}>{curso.paralelo}</span>
            </div>
          </div>

          <Badge className={`${config.bgColor} ${config.textColor} border ${config.borderColor} w-full justify-center text-xs`} variant="outline">
            {curso.especialidad}
          </Badge>

          <div className="flex gap-1 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(curso)}
              className="flex-1 h-7 text-xs cursor-pointer"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(curso)}
              className="flex-1 h-7 text-xs cursor-pointer"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="h-7 w-7 p-0 cursor-pointer"
            >
              {isActive ? (
                <PowerOff className="h-3 w-3" />
              ) : (
                <Power className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar cambio de estado</h3>
            </div>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas <strong>{isActive ? 'desactivar' : 'activar'}</strong> el curso{' '}
              <strong>{NIVEL_DISPLAY_MAP[curso.nivel]} - {curso.paralelo}</strong>?
              {isActive && (
                <>
                  <br /><br />
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  isActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isActive ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}