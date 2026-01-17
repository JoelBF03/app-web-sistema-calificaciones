'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/ui/dialog';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Loader2, Info, Edit, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { calificacionProyectoService } from '@/lib/services/calificacion-proyecto';
import { TrimestreEstado } from '@/lib/types';

interface ModalDetalleProyectoProps {
  calificacion_id: string;
  estudiante_nombre: string;
  isTutor: boolean;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trimestreEstado?: TrimestreEstado;
}

export function ModalDetalleProyecto({
  calificacion_id,
  estudiante_nombre,
  isTutor,
  open,
  onClose,
  onSuccess,
  trimestreEstado
}: ModalDetalleProyectoProps) {
  const [calificacion, setCalificacion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [mostrarConfirmacionEditar, setMostrarConfirmacionEditar] = useState(false);
  
  // ✅ Validación similar a ModalDetalleCalificacion
  const puedeEditar = isTutor && trimestreEstado !== TrimestreEstado.FINALIZADO;

  useEffect(() => {
    if (open) {
      cargarCalificacion();
    }
  }, [open, calificacion_id]);

  const cargarCalificacion = async () => {
    try {
      setIsLoading(true);
      const data = await calificacionProyectoService.findOne(calificacion_id);
      setCalificacion(data);
      setNuevaNota(data.calificacion_proyecto.toString());
      setObservaciones(data.observaciones || '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar calificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditar = () => {
    setIsEditing(true);
  };

  const handleCancelar = () => {
    setNuevaNota(calificacion.calificacion_proyecto.toString());
    setObservaciones(calificacion.observaciones || '');
    setIsEditing(false);
  };

  const handleSolicitarGuardar = () => {
    if (!nuevaNota || nuevaNota.trim() === '') {
      toast.error('Debes ingresar una nota');
      return;
    }

    const nota = parseFloat(nuevaNota);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      toast.error('La nota debe estar entre 0 y 10');
      return;
    }

    setMostrarConfirmacionEditar(true);
  };

  const handleGuardar = async () => {
    try {
      setIsSaving(true);
      setMostrarConfirmacionEditar(false);
      
      const nota = parseFloat(nuevaNota);
      await calificacionProyectoService.update(calificacion_id, {
        calificacion_proyecto: nota,
        observaciones: observaciones.trim() || undefined
      });

      toast.success('Calificación actualizada. Registro guardado.');
      setIsEditing(false);
      await cargarCalificacion();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSolicitarEliminar = () => {
    setMostrarConfirmacionEliminar(true);
  };

  const handleEliminar = async () => {
    try {
      setIsDeleting(true);
      setMostrarConfirmacionEliminar(false);
      
      await calificacionProyectoService.remove(calificacion_id);
      toast.success('Calificación eliminada. Registro guardado.');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    } finally {
      setIsDeleting(false);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Calificación - Proyecto Integrador</DialogTitle>
          <DialogDescription>
            Estudiante: <strong>{estudiante_nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : calificacion ? (
          <div className="space-y-6">
            {/* ✅ Alerta de estado (similar a ModalDetalleCalificacion) */}
            {!puedeEditar && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {!isTutor 
                    ? 'Solo el tutor del curso puede modificar o eliminar esta calificación.'
                    : trimestreEstado === TrimestreEstado.FINALIZADO
                    ? 'El trimestre está finalizado. No se pueden realizar cambios.'
                    : 'No se puede editar esta calificación.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Información de la calificación */}
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Calificación</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Number(calificacion.calificacion_proyecto).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de registro</p>
                    <p className="text-sm font-medium">{formatearFecha(calificacion.createdAt)}</p>
                  </div>
                </div>

                {calificacion.observaciones && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Observaciones</p>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{calificacion.observaciones}</p>
                  </div>
                )}

                {/* ✅ Solo mostrar botones si puede editar */}
                {puedeEditar && (
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleEditar}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={handleSolicitarEliminar}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Modo edición
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Calificación
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSolicitarGuardar}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={handleCancelar}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Modal de confirmación para editar */}
            {mostrarConfirmacionEditar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-lg font-semibold">Advertencia</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Esta función está diseñada únicamente para corregir errores. El cambio quedará registrado en el sistema. ¿Deseas continuar?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGuardar}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setMostrarConfirmacionEditar(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {mostrarConfirmacionEliminar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-semibold">Advertencia</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Esta función está diseñada únicamente para corregir errores. La eliminación quedará registrada en el sistema. ¿Deseas continuar?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEliminar}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setMostrarConfirmacionEliminar(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog> 
  );
}