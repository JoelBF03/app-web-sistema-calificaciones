// nextjs-frontend/lib/components/features/calificaciones/ModalRecuperacion.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Loader2, Save, Trash2, Calendar, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { recuperacionInsumoService } from '@/lib/services/recuperacion-insumo';
import { EstadoInsumo, HistorialRecuperacion } from '@/lib/types/calificaciones.types';

interface ModalRecuperacionProps {
  calificacion_insumo_id: string;
  estudiante_nombre: string;
  insumo_estado: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalRecuperacion({
  calificacion_insumo_id,
  estudiante_nombre,
  insumo_estado,
  open,
  onClose,
  onSuccess
}: ModalRecuperacionProps) {
  const [historial, setHistorial] = useState<HistorialRecuperacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    if (open) {
      cargarHistorial();
    }
  }, [open, calificacion_insumo_id]);

  const cargarHistorial = async () => {
    try {
      setIsLoading(true);
      const data = await recuperacionInsumoService.getByCalificacion(calificacion_insumo_id);
      setHistorial(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar historial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!nuevaNota || nuevaNota.trim() === '') {
      toast.error('Debes ingresar una nota de recuperación');
      return;
    }

    const nota = parseFloat(nuevaNota);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      toast.error('La nota de recuperación debe estar entre 0 y 10');
      return;
    }

    try {
      setIsSaving(true);
      await recuperacionInsumoService.create({
        calificacion_insumo_id,
        nota_recuperacion: nota,
        observaciones: observaciones.trim() || undefined
      });

      toast.success('Recuperación registrada exitosamente');
      setNuevaNota('');
      setObservaciones('');
      await cargarHistorial();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar recuperación');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este intento de recuperación?')) return;

    try {
      await recuperacionInsumoService.delete(id);
      toast.success('Intento eliminado');
      await cargarHistorial();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const puedeRecuperar = insumo_estado === EstadoInsumo.ACTIVO;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recuperación de Insumo</DialogTitle>
          <DialogDescription>
            Estudiante: <strong>{estudiante_nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : historial ? (
          <div className="space-y-6">
            {/* Información de calificaciones */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nota Original:</span>
                {/* ✅ CORREGIDO: Convertir a Number antes de .toFixed() */}
                <span className="font-bold text-lg">{Number(historial.calificacion.nota_original).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nota Final:</span>
                {/* ✅ CORREGIDO: Convertir a Number antes de .toFixed() */}
                <span className={`font-bold text-lg ${Number(historial.calificacion.nota_final) >= 7 ? 'text-green-600' :
                  Number(historial.calificacion.nota_final) >= 4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {Number(historial.calificacion.nota_final).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Intentos Realizados:</span>
                <span className="font-semibold">{historial.total_intentos} / 2</span>
              </div>
            </div>

            {/* Alerta de nota máxima */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                La nota final será el <strong>promedio</strong> entre la nota original y las nota de recuperación.
              </AlertDescription>
            </Alert>

            {/* Historial de recuperaciones */}
            {historial.recuperaciones.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Historial de Recuperaciones</h3>
                {historial.recuperaciones.map((rec) => (
                  <div key={rec.id} className="bg-white border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Intento {rec.intento}:</span>
                          {/* ✅ CORREGIDO: Convertir a Number antes de .toFixed() */}
                          <span className={`font-bold ${Number(rec.nota_recuperacion) >= 7 ? 'text-green-600' :
                            Number(rec.nota_recuperacion) >= 4 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                            {Number(rec.nota_recuperacion).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatearFecha(rec.createdAt)}
                        </div>
                        {rec.observaciones && (
                          <p className="text-sm text-gray-600 mt-1">{rec.observaciones}</p>
                        )}
                      </div>
                      {puedeRecuperar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(rec.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para nueva recuperación */}
            {puedeRecuperar && historial.intentos_restantes > 0 ? (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-sm text-gray-700">Registrar Nueva Recuperación</h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nota de Recuperación (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Ej: 10.0"
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Observaciones (opcional)</label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Comentarios sobre la recuperación..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleGuardar}
                  disabled={isSaving}
                  className="w-full bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Recuperación
                </Button>
              </div>
            ) : !puedeRecuperar ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {insumo_estado === EstadoInsumo.PUBLICADO
                    ? 'El insumo está publicado. Solicita al administrador que lo reactive para registrar recuperaciones.'
                    : 'El insumo está cerrado. No se pueden registrar recuperaciones.'}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El estudiante ya utilizó los 2 intentos de recuperación disponibles.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}