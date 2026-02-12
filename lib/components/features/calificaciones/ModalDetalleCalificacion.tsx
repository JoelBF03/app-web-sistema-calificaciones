'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Loader2, Edit2, Trash2, Calendar, Info, RefreshCw, Save, X, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { calificacionInsumoService } from '@/lib/services/calificacion-insumo';
import { recuperacionInsumoService } from '@/lib/services/recuperacion-insumo';
import { EstadoInsumo } from '@/lib/types/calificaciones.types';
import { ModalRecuperacion } from './ModalRecuperacion';
import { Role } from '@/lib/types/usuario.types';

interface ModalDetalleCalificacionProps {
  calificacion_id: string;
  estudiante_nombre: string;
  insumo_estado: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModalDetalleCalificacion({
  calificacion_id,
  estudiante_nombre,
  insumo_estado,
  open,
  onClose,
  onSuccess
}: ModalDetalleCalificacionProps) {
  const [calificacion, setCalificacion] = useState<any>(null);
  const [recuperaciones, setRecuperaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [abrirRecuperacion, setAbrirRecuperacion] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Estados para editar recuperaciones
  const [editandoRecuperacion, setEditandoRecuperacion] = useState<string | null>(null);
  const [notaRecuperacionEdit, setNotaRecuperacionEdit] = useState('');
  const [observacionesRecuperacionEdit, setObservacionesRecuperacionEdit] = useState('');
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [isUpdatingRecuperacion, setIsUpdatingRecuperacion] = useState(false);
  const [isDeletingRecuperacion, setIsDeletingRecuperacion] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  useEffect(() => {
    if (open) {
      cargarCalificacion();
    }
  }, [open, calificacion_id]);

  const cargarCalificacion = async () => {
    try {
      setIsLoading(true);
      const data = await calificacionInsumoService.findOne(calificacion_id);
      setCalificacion(data);
      setNuevaNota(data.nota_original.toString());
      setObservaciones(data.observaciones || '');

      try {
        const historial = await recuperacionInsumoService.getByCalificacion(calificacion_id);
        setRecuperaciones(historial.recuperaciones || []);
      } catch (error) {
        setRecuperaciones([]);
      }
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
    setNuevaNota(calificacion.nota_original.toString());
    setObservaciones(calificacion.observaciones || '');
    setIsEditing(false);
  };

  const handleGuardar = async () => {
    if (!nuevaNota || nuevaNota.trim() === '') {
      toast.error('Debes ingresar una nota');
      return;
    }

    const nota = parseFloat(nuevaNota);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      toast.error('La nota debe estar entre 0 y 10');
      return;
    }

    try {
      setIsSaving(true);
      await calificacionInsumoService.update(calificacion_id, {
        nota,
        observaciones: observaciones.trim() || undefined
      });

      toast.success('Calificación actualizada');
      setIsEditing(false);
      await cargarCalificacion();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setIsSaving(false);
    }
  };

  const abrirConfirmacion = () => {
    setMostrarConfirmacionEliminar(true);
  };

  const handleEliminar = async () => {
    try {
      setIsDeleting(true);
      setMostrarConfirmacionEliminar(false);
      await calificacionInsumoService.remove(calificacion_id);
      toast.success('Calificación eliminada');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditarRecuperacion = (rec: any) => {
    setEditandoRecuperacion(rec.id);
    setNotaRecuperacionEdit(rec.nota_recuperacion.toString());
    setObservacionesRecuperacionEdit(rec.observaciones || '');
  };

  const handleCancelarEditRecuperacion = () => {
    setEditandoRecuperacion(null);
    setNotaRecuperacionEdit('');
    setObservacionesRecuperacionEdit('');
  };

  const handleGuardarRecuperacion = async (id: string) => {
    const nota = parseFloat(notaRecuperacionEdit);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      toast.error('La nota debe estar entre 0 y 10');
      return;
    }

    try {
      setIsUpdatingRecuperacion(true);
      await recuperacionInsumoService.update(id, {
        nota_recuperacion: nota,
        observaciones: observacionesRecuperacionEdit.trim() || undefined
      });

      toast.success('Recuperación actualizada');
      setEditandoRecuperacion(null);
      await cargarCalificacion();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar recuperación');
    } finally {
      setIsUpdatingRecuperacion(false);
    }
  };

  const handleEliminarRecuperacion = async (id: string, intento: number) => {
    if (!confirm(`¿Eliminar el intento ${intento} de recuperación? Esta acción recalculará la nota final.`)) return;

    try {
      setIsDeletingRecuperacion(true);
      await recuperacionInsumoService.delete(id);
      await cargarCalificacion();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar recuperación');
    } finally {
      setIsDeletingRecuperacion(false);
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

  const puedeEditar = insumo_estado === EstadoInsumo.ACTIVO && !isAdmin;

  const puedeRecuperar = () => {
    if (!calificacion) return false;
    if (insumo_estado !== EstadoInsumo.ACTIVO) return false;
    if (Number(calificacion.nota_original) >= 10) return false;
    return recuperaciones.length < 2;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Calificación</DialogTitle>
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
            {!puedeEditar && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {insumo_estado === EstadoInsumo.PUBLICADO
                    ? 'El insumo está publicado. Solicita al administrador que lo reactive para editar.'
                    : insumo_estado === EstadoInsumo.CERRADO
                      ? 'El insumo está cerrado. No se pueden realizar cambios.'
                      : 'El insumo está en borrador.'}
                </AlertDescription>
              </Alert>
            )}

            {!isEditing ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <div>
                      <div className="text-sm text-gray-600">Nota Original:</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Creada: {formatearFecha(calificacion.createdAt)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-xl">{Number(calificacion.nota_original).toFixed(2)}</span>
                  </div>

                  {recuperaciones.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-sm font-semibold text-gray-700">Intentos de Recuperación:</div>
                      {recuperaciones.map((rec) => (
                        <div key={rec.id} className="bg-white border rounded-lg p-3">
                          {editandoRecuperacion === rec.id ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">Editar Intento {rec.intento}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelarEditRecuperacion}
                                  disabled={isUpdatingRecuperacion}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-600">Nota (0-10)</label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.01"
                                  value={notaRecuperacionEdit}
                                  onChange={(e) => setNotaRecuperacionEdit(e.target.value)}
                                  className="mt-1"
                                  disabled={isUpdatingRecuperacion}
                                />
                              </div>

                              <div>
                                <label className="text-xs font-medium text-gray-600">Observaciones</label>
                                <Textarea
                                  value={observacionesRecuperacionEdit}
                                  onChange={(e) => setObservacionesRecuperacionEdit(e.target.value)}
                                  rows={2}
                                  className="mt-1"
                                  disabled={isUpdatingRecuperacion}
                                />
                              </div>

                              <Button
                                onClick={() => handleGuardarRecuperacion(rec.id)}
                                size="sm"
                                disabled={isUpdatingRecuperacion}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {isUpdatingRecuperacion ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Save className="w-3 h-3 mr-2" />}
                                Guardar Cambios
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold">Intento {rec.intento}:</span>
                                  <span className={`font-bold text-lg ${Number(rec.nota_recuperacion) >= 7 ? 'text-green-600' :
                                    Number(rec.nota_recuperacion) >= 4 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {Number(rec.nota_recuperacion).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                  <Calendar className="w-3 h-3" />
                                  {formatearFecha(rec.createdAt)}
                                </div>
                                {rec.observaciones && (
                                  <p className="text-sm text-gray-600 mt-1">{rec.observaciones}</p>
                                )}
                              </div>

                              {puedeEditar && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditarRecuperacion(rec)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Editar recuperación"
                                    disabled={isDeletingRecuperacion}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEliminarRecuperacion(rec.id, rec.intento)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Eliminar recuperación"
                                    disabled={isDeletingRecuperacion}
                                  >
                                    {isDeletingRecuperacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {Number(calificacion.nota_final) !== Number(calificacion.nota_original) && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div>
                        <div className="text-sm text-gray-600">Nota Final (con recuperación):</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>Actualizada: {formatearFecha(calificacion.updatedAt)}</span>
                        </div>
                      </div>
                      <span className={`font-bold text-xl ${Number(calificacion.nota_final) >= 7 ? 'text-green-600' :
                        Number(calificacion.nota_final) >= 4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {Number(calificacion.nota_final).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {calificacion.observaciones && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Observaciones:</strong> {calificacion.observaciones}
                      </p>
                    </div>
                  )}
                </div>

                {puedeEditar && (
                  <div className="space-y-2">
                    {puedeRecuperar() && !isAdmin && (
                      <Button
                        onClick={() => setAbrirRecuperacion(true)}
                        className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Registrar Recuperación ({2 - recuperaciones.length} intento{recuperaciones.length === 1 ? '' : 's'} restante{recuperaciones.length === 1 ? '' : 's'})
                      </Button>
                    )}

                    <div className="flex gap-2">
                      {recuperaciones.length === 0 && (

                        <Button
                          onClick={handleEditar}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"

                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar Nota Original
                        </Button>

                      )}

                      <Button
                        onClick={abrirConfirmacion}
                        disabled={isDeleting}
                        variant="destructive"
                        className="flex-1 cursor-pointer"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nota Original (0-10)</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={nuevaNota}
                    onChange={(e) => setNuevaNota(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Observaciones (opcional)</label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Comentarios sobre la calificación..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGuardar}
                    disabled={isSaving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Guardar Cambios
                  </Button>
                  <Button
                    onClick={handleCancelar}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>

      {abrirRecuperacion && calificacion && (
        <ModalRecuperacion
          calificacion_insumo_id={calificacion_id}
          estudiante_nombre={estudiante_nombre}
          insumo_estado={insumo_estado}
          open={abrirRecuperacion}
          onClose={() => {
            setAbrirRecuperacion(false);
            cargarCalificacion();
          }}
          onSuccess={() => {
            setAbrirRecuperacion(false);
            cargarCalificacion();
            onSuccess();
          }}
        />
      )}
    </Dialog>
  );
}