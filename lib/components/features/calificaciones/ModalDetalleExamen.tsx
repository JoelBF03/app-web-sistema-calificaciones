'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Textarea } from '@/lib/components/ui/textarea';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Loader2, Trash2, Edit2, Info, Save, X, Plus, Calendar } from 'lucide-react';
import { calificacionExamenService } from '@/lib/services/calificacion-examen';
import { useRecuperacionExamen } from '@/lib/hooks/useRecuperacionExamen';
import { toast } from 'sonner';
import { TrimestreEstado } from '@/lib/types/periodo.types';

interface ModalDetalleExamenProps {
  calificacion_id: string;
  estudiante_nombre: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  trimestreEstado?: TrimestreEstado;
}

export function ModalDetalleExamen({
  calificacion_id,
  estudiante_nombre,
  open,
  onClose,
  onSuccess,
  trimestreEstado
}: ModalDetalleExamenProps) {
  const [calificacion, setCalificacion] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [mostrarConfirmacionEditar, setMostrarConfirmacionEditar] = useState(false);
  
  // ✅ NUEVO: Modal de confirmación para eliminar recuperación
  const [mostrarConfirmacionEliminarRecuperacion, setMostrarConfirmacionEliminarRecuperacion] = useState(false);

  // Estados para recuperación
  const [abrirRecuperacion, setAbrirRecuperacion] = useState(false);
  const [segundoExamen, setSegundoExamen] = useState('');
  const [trabajoRefuerzo, setTrabajoRefuerzo] = useState('');
  const [observacionesRecuperacion, setObservacionesRecuperacion] = useState('');
  const [editandoRecuperacion, setEditandoRecuperacion] = useState(false);

  const { historial, recuperacion, necesitaTrabajoRefuerzo, isLoading: loadingRecuperacion, refetch, crearRecuperacion, actualizarRecuperacion, eliminarRecuperacion, isCreating, isUpdating, isDeleting: isDeletingRecuperacion } = useRecuperacionExamen(calificacion_id);

  const puedeEditar = trimestreEstado !== TrimestreEstado.FINALIZADO;

  useEffect(() => {
    if (open) {
      cargarCalificacion();
    }
  }, [open, calificacion_id]);

  useEffect(() => {
    if (recuperacion) {
      setSegundoExamen(recuperacion.segundo_examen ? Number(recuperacion.segundo_examen).toString() : '');
      setTrabajoRefuerzo(recuperacion.trabajo_refuerzo ? Number(recuperacion.trabajo_refuerzo).toString() : '');
      setObservacionesRecuperacion(recuperacion.observaciones || '');
    }
  }, [recuperacion]);

  const cargarCalificacion = async () => {
    try {
      setIsLoading(true);
      const data = await calificacionExamenService.findOne(calificacion_id);
      setCalificacion(data);
      setNuevaNota(Number(data.calificacion_examen).toString());
      setObservaciones(data.observaciones || '');
      refetch();
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
    setNuevaNota(Number(calificacion.calificacion_examen).toString());
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
      await calificacionExamenService.update(calificacion_id, {
        calificacion_examen: nota,
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
      
      await calificacionExamenService.remove(calificacion_id);
      toast.success('Calificación eliminada. Registro guardado.');
      
      // ✅ ACTUALIZAR LISTA ANTES DE CERRAR
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
      setIsDeleting(false);
    }
  };

  // FUNCIONES PARA RECUPERACIÓN
  const handleAbrirRecuperacion = () => {
    setAbrirRecuperacion(true);
    setEditandoRecuperacion(false);
    if (!recuperacion) {
      setSegundoExamen('');
      setTrabajoRefuerzo('');
      setObservacionesRecuperacion('');
    }
  };

  const handleCerrarRecuperacion = () => {
    setAbrirRecuperacion(false);
    setEditandoRecuperacion(false);
    setSegundoExamen(recuperacion?.segundo_examen ? Number(recuperacion.segundo_examen).toString() : '');
    setTrabajoRefuerzo(recuperacion?.trabajo_refuerzo ? Number(recuperacion.trabajo_refuerzo).toString() : '');
    setObservacionesRecuperacion(recuperacion?.observaciones || '');
  };

  const handleEditarRecuperacion = () => {
    setEditandoRecuperacion(true);
    setAbrirRecuperacion(true);
  };

  const handleGuardarRecuperacion = async () => {
    const segundoExamenNum = parseFloat(segundoExamen);
    
    if (isNaN(segundoExamenNum) || segundoExamenNum < 0 || segundoExamenNum > 10) {
      toast.error('El segundo examen debe estar entre 0 y 10');
      return;
    }

    if (necesitaTrabajoRefuerzo) {
      const trabajoRefuerzoNum = parseFloat(trabajoRefuerzo);
      if (isNaN(trabajoRefuerzoNum) || trabajoRefuerzoNum < 0 || trabajoRefuerzoNum > 10) {
        toast.error('El trabajo de refuerzo debe estar entre 0 y 10');
        return;
      }
    }

    try {
      if (recuperacion) {
        // Actualizar
        actualizarRecuperacion({
          id: recuperacion.id,
          data: {
            segundo_examen: segundoExamenNum,
            trabajo_refuerzo: necesitaTrabajoRefuerzo ? parseFloat(trabajoRefuerzo) : undefined,
            observaciones: observacionesRecuperacion.trim() || undefined
          }
        });
      } else {
        // Crear
        crearRecuperacion({
          calificacion_examen_id: calificacion_id,
          segundo_examen: segundoExamenNum,
          trabajo_refuerzo: necesitaTrabajoRefuerzo ? parseFloat(trabajoRefuerzo) : undefined,
          observaciones: observacionesRecuperacion.trim() || undefined
        });
      }
      
      setAbrirRecuperacion(false);
      setEditandoRecuperacion(false);
      await cargarCalificacion();
      onSuccess();
    } catch (error: any) {
      // El error ya se maneja en el hook
    }
  };

  // ✅ NUEVA FUNCIÓN: Solicitar confirmación antes de eliminar
  const handleSolicitarEliminarRecuperacion = () => {
    setMostrarConfirmacionEliminarRecuperacion(true);
  };

  // ✅ MODIFICADA: Eliminar con confirmación de modal
  const handleEliminarRecuperacion = async () => {
    if (!recuperacion) return;

    try {
      setMostrarConfirmacionEliminarRecuperacion(false);
      eliminarRecuperacion(recuperacion.id);
      await cargarCalificacion();
      onSuccess();
    } catch (error: any) {
      // El error ya se maneja en el hook
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

  const puedeRecuperar = () => {
    if (!calificacion) return false;
    if (trimestreEstado !== TrimestreEstado.ACTIVO) return false;
    const notaActual = historial?.calificacion?.calificacion_original 
      ? Number(historial.calificacion.calificacion_original)
      : Number(calificacion.calificacion_examen);
    return notaActual < 10;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* ✅ AGRANDADO EL MODAL */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Calificación - Examen Trimestral</DialogTitle>
          <DialogDescription>
            Estudiante: <strong>{estudiante_nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading || loadingRecuperacion ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : calificacion ? (
          <div className="space-y-6">
            {/* Alerta de estado */}
            {!puedeEditar && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  El trimestre está finalizado. No se pueden realizar cambios en la calificación.
                </AlertDescription>
              </Alert>
            )}

            {/* Información de la calificación */}
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Calificación</Label>
                    <p className="text-2xl font-bold text-red-600">{Number(calificacion.calificacion_examen).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Registrada el</Label>
                    <p className="text-sm text-gray-700">{formatearFecha(calificacion.createdAt)}</p>
                  </div>
                </div>

                {calificacion.observaciones && (
                  <div>
                    <Label className="text-gray-600">Observaciones</Label>
                    <p className="text-sm text-gray-700">{calificacion.observaciones}</p>
                  </div>
                )}

                {/* Mostrar información de recuperación si existe */}
                {recuperacion && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">Recuperación de Examen</h3>
                      {puedeEditar && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditarRecuperacion}
                            disabled={isUpdating}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleSolicitarEliminarRecuperacion}
                            disabled={isDeletingRecuperacion}
                          >
                            {isDeletingRecuperacion ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>

                    <Alert className="bg-blue-50 border-blue-200 mb-3">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {historial?.calificacion?.calificacion_original != null && (
                          <span>
                            Nota original: <strong>{Number(historial.calificacion.calificacion_original).toFixed(2)}</strong> | 
                            Nota final: <strong>{Number(historial.calificacion.calificacion_actual).toFixed(2)}</strong>
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-600">Segundo Examen</Label>
                        <p className="text-lg font-semibold">
                          {recuperacion.segundo_examen ? Number(recuperacion.segundo_examen).toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      {necesitaTrabajoRefuerzo && (
                        <div>
                          <Label className="text-gray-600">Trabajo de Refuerzo</Label>
                          <p className="text-lg font-semibold">
                            {recuperacion.trabajo_refuerzo ? Number(recuperacion.trabajo_refuerzo).toFixed(2) : 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>

                    {recuperacion.observaciones && (
                      <div className="mt-3">
                        <Label className="text-gray-600">Observaciones de recuperación</Label>
                        <p className="text-sm text-gray-700">{recuperacion.observaciones}</p>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Registrada el {formatearFecha(recuperacion.createdAt)}
                    </div>
                  </div>
                )}

                {/* ✅ OCULTAR BOTONES DE CALIFICACIÓN CUANDO SE EDITA RECUPERACIÓN */}
                {puedeEditar && !abrirRecuperacion && (
                  <div className="flex gap-2 pt-4">
                    {/* Botón de recuperación */}
                    {puedeRecuperar() && !recuperacion && (
                      <Button
                        onClick={handleAbrirRecuperacion}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Recuperación
                      </Button>
                    )}
                    
                    <Button onClick={handleEditar} variant="outline">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar Calificación
                    </Button>
                    <Button
                      onClick={handleSolicitarEliminar}
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Modo edición de calificación
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nota">Calificación (0-10)</Label>
                  <Input
                    id="nota"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    placeholder="Ej: 8.50"
                  />
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
                  <Textarea
                    id="observaciones"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Comentarios adicionales..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSolicitarGuardar}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar
                  </Button>
                  <Button onClick={handleCancelar} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Modal de recuperación */}
            {abrirRecuperacion && (
              <div className="border-t pt-4 mt-4 space-y-4">
                <h3 className="font-semibold text-lg">
                  {recuperacion ? 'Editar Recuperación' : 'Agregar Recuperación'}
                </h3>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    {necesitaTrabajoRefuerzo ? (
                      <>
                        <strong>Nota original {'<'} 7.0:</strong> Se requiere segundo examen y trabajo de refuerzo.
                        La nota final será el promedio de: examen original + segundo examen + trabajo de refuerzo.
                      </>
                    ) : (
                      <>
                        <strong>Nota original ≥ 7.0:</strong> Solo se requiere segundo examen.
                        La nota final será el promedio de: examen original + segundo examen.
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="segundo_examen">Segundo Examen (0-10) *</Label>
                  <Input
                    id="segundo_examen"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={segundoExamen}
                    onChange={(e) => setSegundoExamen(e.target.value)}
                    placeholder="Ej: 8.50"
                  />
                </div>

                {necesitaTrabajoRefuerzo && (
                  <div>
                    <Label htmlFor="trabajo_refuerzo">Trabajo de Refuerzo (0-10) *</Label>
                    <Input
                      id="trabajo_refuerzo"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={trabajoRefuerzo}
                      onChange={(e) => setTrabajoRefuerzo(e.target.value)}
                      placeholder="Ej: 7.00"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="observaciones_rec">Observaciones (Opcional)</Label>
                  <Textarea
                    id="observaciones_rec"
                    value={observacionesRecuperacion}
                    onChange={(e) => setObservacionesRecuperacion(e.target.value)}
                    placeholder="Comentarios adicionales..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleGuardarRecuperacion}
                    disabled={isCreating || isUpdating}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {(isCreating || isUpdating) ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {recuperacion ? 'Actualizar' : 'Guardar'} Recuperación
                  </Button>
                  <Button onClick={handleCerrarRecuperacion} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Modal de confirmación para editar */}
            {mostrarConfirmacionEditar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
                  <h3 className="text-lg font-semibold mb-4">Confirmar Edición</h3>
                  <p className="text-gray-600 mb-6">
                    ¿Estás seguro de que deseas guardar los cambios? Esta acción quedará registrada.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setMostrarConfirmacionEditar(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleGuardar}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      Sí, Guardar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de confirmación para eliminar calificación */}
            {mostrarConfirmacionEliminar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
                  <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
                  <p className="text-gray-600 mb-6">
                    ¿Estás seguro de que deseas eliminar esta calificación? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setMostrarConfirmacionEliminar(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleEliminar}
                      variant="destructive"
                    >
                      Sí, Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ NUEVO: Modal de confirmación para eliminar recuperación */}
            {mostrarConfirmacionEliminarRecuperacion && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
                  <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación de Recuperación</h3>
                  <p className="text-gray-600 mb-6">
                    ¿Estás seguro de que deseas eliminar la recuperación? Esta acción restaurará la calificación original.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setMostrarConfirmacionEliminarRecuperacion(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleEliminarRecuperacion}
                      variant="destructive"
                      disabled={isDeletingRecuperacion}
                    >
                      {isDeletingRecuperacion ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Sí, Eliminar
                    </Button>
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