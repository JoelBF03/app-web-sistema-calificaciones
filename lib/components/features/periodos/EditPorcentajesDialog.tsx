'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { 
  Percent, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  GraduationCap,
  CheckCircle2,
  Info
} from 'lucide-react';
import { TipoEvaluacion } from '@/lib/types/tipos-evaluacion.types';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import { useTiposEvaluacion } from '@/lib/hooks/useTiposEvaluacion';
import { toast } from 'sonner';

interface EditPorcentajesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  periodoId: string;
  tiposEvaluacion: TipoEvaluacion[];
  onSuccess: () => void;
}

export default function EditPorcentajesDialog({
  isOpen,
  onClose,
  periodoId,
  tiposEvaluacion,
  onSuccess
}: EditPorcentajesDialogProps) {
  const { updateBatch, isUpdatingBatch } = useTiposEvaluacion(periodoId);
  const [checkingPromedios, setCheckingPromedios] = useState(false);
  const [hayPromedios, setHayPromedios] = useState(false);
  const [porcentajes, setPorcentajes] = useState({
    insumos: 0,
    proyecto: 0,
    examen: 0
  });

  useEffect(() => {
    if (isOpen && tiposEvaluacion.length > 0) {
      const insumos = tiposEvaluacion.find(t => t.nombre.includes('INSUMO'));
      const proyecto = tiposEvaluacion.find(t => t.nombre.includes('PROYECTO'));
      const examen = tiposEvaluacion.find(t => t.nombre.includes('EXAMEN'));

      setPorcentajes({
        insumos: insumos ? Number(insumos.porcentaje) : 0,
        proyecto: proyecto ? Number(proyecto.porcentaje) : 0,
        examen: examen ? Number(examen.porcentaje) : 0
      });

      checkPromedios();
    }
  }, [isOpen, tiposEvaluacion]);

  const checkPromedios = async () => {
    setCheckingPromedios(true);
    try {
      const response = await tiposEvaluacionService.verificarPromediosGenerados(periodoId);
      setHayPromedios(response.hayPromedios);
    } catch (error) {
      setHayPromedios(false);
    } finally {
      setCheckingPromedios(false);
    }
  };

  const getTotalPorcentaje = () => {
    return porcentajes.insumos + porcentajes.proyecto + porcentajes.examen;
  };

  const isValid = () => {
    const total = getTotalPorcentaje();
    return total === 100 && 
           porcentajes.insumos > 0 && 
           porcentajes.proyecto > 0 && 
           porcentajes.examen > 0;
  };

  const hasChanges = () => {
    const insumos = tiposEvaluacion.find(t => t.nombre.includes('INSUMO'));
    const proyecto = tiposEvaluacion.find(t => t.nombre.includes('PROYECTO'));
    const examen = tiposEvaluacion.find(t => t.nombre.includes('EXAMEN'));

    return porcentajes.insumos !== Number(insumos?.porcentaje) ||
           porcentajes.proyecto !== Number(proyecto?.porcentaje) ||
           porcentajes.examen !== Number(examen?.porcentaje);
  };

  const handleSave = async () => {
    if (!isValid()) {
      toast.error('Los porcentajes deben sumar exactamente 100%');
      return;
    }

    if (!hasChanges()) {
      toast.info('No se detectaron cambios en los porcentajes');
      return;
    }

    try {
      await updateBatch(periodoId, porcentajes);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al actualizar los porcentajes');
    }
  };

  const total = getTotalPorcentaje();
  const diferencia = 100 - total;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-purple-600" />
            Editar Porcentajes de Evaluación
          </DialogTitle>
          <DialogDescription>
            Modifica la distribución porcentual de los tipos de evaluación del período
          </DialogDescription>
        </DialogHeader>

        {checkingPromedios ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-3">Verificando promedios generados...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hayPromedios && (
              <Alert className="border-2 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <p className="font-semibold text-orange-900 mb-2">Promedios ya generados</p>
                  <div className="text-sm text-orange-700 space-y-1.5">
                    <p>Este período ya tiene promedios de trimestre generados.</p>
                    <p className="font-medium">Para aplicar los nuevos porcentajes debes:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Cambiar los trimestres de FINALIZADO → ACTIVO</li>
                      <li>Modificar los porcentajes aquí</li>
                      <li>Volver a cambiar los trimestres de ACTIVO → FINALIZADO</li>
                    </ol>
                    <p className="mt-2">Esto regenerará los promedios con los nuevos porcentajes.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!hayPromedios && (
              <Alert className="border-2 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <p className="text-sm text-blue-700">
                    No hay promedios generados aún. Puedes modificar los porcentajes libremente.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Insumos */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <div className="p-1.5 bg-red-100 rounded">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  Insumos
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={porcentajes.insumos}
                    onChange={(e) => setPorcentajes({
                      ...porcentajes,
                      insumos: Math.max(0, Math.min(100, Number(e.target.value)))
                    })}
                    className="border-2"
                  />
                  <span className="text-lg font-bold text-gray-600">%</span>
                </div>
              </div>

              {/* Proyecto */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <div className="p-1.5 bg-yellow-100 rounded">
                    <BookOpen className="h-4 w-4 text-yellow-600" />
                  </div>
                  Proyecto
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={porcentajes.proyecto}
                    onChange={(e) => setPorcentajes({
                      ...porcentajes,
                      proyecto: Math.max(0, Math.min(100, Number(e.target.value)))
                    })}
                    className="border-2"
                  />
                  <span className="text-lg font-bold text-gray-600">%</span>
                </div>
              </div>

              {/* Examen */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <div className="p-1.5 bg-gray-100 rounded">
                    <GraduationCap className="h-4 w-4 text-gray-700" />
                  </div>
                  Examen
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={porcentajes.examen}
                    onChange={(e) => setPorcentajes({
                      ...porcentajes,
                      examen: Math.max(0, Math.min(100, Number(e.target.value)))
                    })}
                    className="border-2"
                  />
                  <span className="text-lg font-bold text-gray-600">%</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className={`p-4 rounded-lg border-2 ${
              total === 100 
                ? 'bg-green-50 border-green-300' 
                : total > 100 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Total</span>
                <span className={`text-2xl font-bold ${
                  total === 100 ? 'text-green-700' : total > 100 ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {total}%
                </span>
              </div>
              {total !== 100 && (
                <p className={`text-sm ${
                  total > 100 ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {total > 100 
                    ? `Excede por ${Math.abs(diferencia)}%` 
                    : `Falta ${Math.abs(diferencia)}%`
                  }
                </p>
              )}
            </div>

            {isValid() && hasChanges() && (
              <Alert className="border-2 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="text-sm text-green-700 font-medium">
                    Los porcentajes son válidos y se aplicarán al período
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-2"
            disabled={isUpdatingBatch}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid() || !hasChanges() || isUpdatingBatch || checkingPromedios}
            className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-md"
          >
            {isUpdatingBatch ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}