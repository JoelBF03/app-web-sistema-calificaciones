'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { 
  Power, 
  XCircle, 
  Lock, 
  CheckCircle2,
  AlertTriangle,
  Users,
  BookOpen,
  FileText,
  GraduationCap
} from 'lucide-react';
import { PeriodoLectivo, EstadoPeriodo, Trimestre, TrimestreEstado } from '@/lib/types/periodo.types';

interface ConfirmCambiarEstadoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodo: PeriodoLectivo;
  trimestres: Trimestre[];
}

export default function ConfirmCambiarEstadoDialog({
  isOpen,
  onClose,
  onConfirm,
  periodo,
  trimestres,
}: ConfirmCambiarEstadoDialogProps) {
  
  const isActive = periodo.estado === EstadoPeriodo.ACTIVO;
  
  const trimestresFinalizados = trimestres.filter(t => t.estado === TrimestreEstado.FINALIZADO).length;
  const todosTrimestresFinalizados = trimestres.length > 0 && trimestresFinalizados === trimestres.length;
  
  const canFinalizar = isActive && todosTrimestresFinalizados;

  if (!isActive) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              No se puede reactivar el período
            </DialogTitle>
            <DialogDescription>
              El período <strong>"{periodo.nombre}"</strong> está finalizado
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-2 border-red-200 bg-red-50">
            <Lock className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900 mb-2">Acción no permitida</p>
              <div className="text-sm text-red-700 space-y-1.5">
                <p>Un período finalizado <strong>NO puede ser reactivado</strong>.</p>
                <p>Los datos académicos están cerrados permanentemente:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Matrículas finalizadas</li>
                  <li>Estados de estudiantes actualizados</li>
                  <li>Cursos y asignaciones inactivados</li>
                </ul>
                <p className="font-medium mt-3">Para un nuevo año lectivo, debe crear un nuevo período.</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 border-2">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <Power className="h-5 w-5" />
            Finalizar Período Lectivo
          </DialogTitle>
          <DialogDescription>
            Estás a punto de finalizar el período <strong>"{periodo.nombre}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Estado actual:</span>
                <Badge className="bg-green-100 text-green-800 border-green-300 border">
                  Activo
                </Badge>
              </div>
              <span className="text-gray-400 text-xl">→</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Nuevo estado:</span>
                <Badge className="bg-gray-100 text-gray-800 border-gray-300 border">
                  Finalizado
                </Badge>
              </div>
            </div>
          </div>

          {!canFinalizar && (
            <Alert className="border-2 border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <p className="font-semibold text-red-900 mb-2">No se puede finalizar el período</p>
                <div className="text-sm text-red-700 space-y-1">
                  <p>Todos los trimestres deben estar finalizados antes de finalizar el período.</p>
                  <p className="font-medium mt-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Estado actual: {trimestresFinalizados} de {trimestres.length} trimestres finalizados
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {canFinalizar && (
            <>
              <Alert className="border-2 border-orange-200 bg-orange-50">
                <Lock className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <p className="font-semibold text-orange-900 mb-2"> Esta acción es IRREVERSIBLE</p>
                  <ul className="text-sm text-orange-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Estudiantes:</strong> Se actualizarán estados (graduados o sin matrícula según corresponda)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Matrículas:</strong> Todas las matrículas activas pasarán a estado FINALIZADO</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Cursos y Asignaciones:</strong> Se inactivarán todos los cursos y asignaciones materia-curso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span><strong>Graduación:</strong> Estudiantes de 3° Bachillerato con promedio ≥7.0 en todas las materias serán graduados</span>
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert className="border-2 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <p className="text-sm text-red-700 font-medium">
                    Una vez finalizado, el período <strong>NO podrá ser reactivado</strong>. Los datos académicos quedarán cerrados permanentemente.
                  </p>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-2">
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!canFinalizar}
            className={`flex-1 shadow-md ${
              !canFinalizar 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <Power className="mr-2 h-4 w-4" />
            Finalizar Período
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}