'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Textarea } from '@/lib/components/ui/textarea';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Separator } from '@/lib/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/lib/components/ui/alert-dialog';
import { Loader2, Edit, Save, X, Trash2, AlertTriangle, Info, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCalificacionInsumo } from '@/lib/hooks/useCalificacionInsumo';
import { useRecuperacionInsumo } from '@/lib/hooks/useRecuperacionInsumo';
import { ModalRecuperacion } from './ModalRecuperacion';
import { EstadoInsumo } from '@/lib/types/calificaciones.types';
import { Role } from '@/lib/types';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [abrirRecuperacion, setAbrirRecuperacion] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados para confirmación de eliminación
  const [confirmarEliminarCalificacion, setConfirmarEliminarCalificacion] = useState(false);
  const [confirmarEliminarRecuperacion, setConfirmarEliminarRecuperacion] = useState<{ id: string; intento: number } | null>(null);

  // Estados para editar recuperaciones
  const [editandoRecuperacion, setEditandoRecuperacion] = useState<string | null>(null);
  const [notaRecuperacionEdit, setNotaRecuperacionEdit] = useState('');
  const [observacionesRecuperacionEdit, setObservacionesRecuperacionEdit] = useState('');

  const {
    obtenerCalificacion,
    actualizarCalificacion,
    eliminarCalificacion,
    isUpdating,
    isDeleting,
    isLoadingOne
  } = useCalificacionInsumo();

  const {
    historial,
    actualizarRecuperacion,
    eliminarRecuperacion,
    isUpdating: isUpdatingRecuperacion,
    isDeleting: isDeletingRecuperacion,
    refetch: refetchRecuperaciones
  } = useRecuperacionInsumo(calificacion_id);

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  useEffect(() => {
    if (open && calificacion_id) {
      cargarCalificacion();
    }
  }, [open, calificacion_id]);

  const cargarCalificacion = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerCalificacion(calificacion_id);
      setCalificacion(data);
      setNuevaNota(data.nota_original.toString());
      setObservaciones(data.observaciones || '');
      await refetchRecuperaciones();
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

    actualizarCalificacion(
      { id: calificacion_id, data: { nota, observaciones: observaciones.trim() || undefined } },
      {
        onSuccess: () => {
          setIsEditing(false);
          cargarCalificacion();
          onSuccess();
        }
      }
    );
  };

  const handleEliminarCalificacion = () => {
    eliminarCalificacion(calificacion_id, {
      onSuccess: () => {
        setConfirmarEliminarCalificacion(false);
        onSuccess();
        onClose();
      }
    });
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

  const handleGuardarRecuperacion = (id: string) => {
    const nota = parseFloat(notaRecuperacionEdit);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      toast.error('La nota debe estar entre 0 y 10');
      return;
    }

    actualizarRecuperacion(
      { id, data: { nota_recuperacion: nota, observaciones: observacionesRecuperacionEdit.trim() || undefined } },
      {
        onSuccess: () => {
          setEditandoRecuperacion(null);
          cargarCalificacion();
          onSuccess();
        }
      }
    );
  };

  const handleEliminarRecuperacion = () => {
    if (!confirmarEliminarRecuperacion) return;

    eliminarRecuperacion(confirmarEliminarRecuperacion.id, {
      onSuccess: () => {
        setConfirmarEliminarRecuperacion(null);
        cargarCalificacion();
        onSuccess();
      }
    });
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
    const recuperaciones = historial?.recuperaciones || [];
    return recuperaciones.length < 2;
  };

  const recuperaciones = historial?.recuperaciones || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Calificación</DialogTitle>
            <DialogDescription>
              Estudiante: <strong>{estudiante_nombre}</strong>
            </DialogDescription>
          </DialogHeader>

          {isLoading || isLoadingOne ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : calificacion ? (
            <div className="space-y-6">
              {!puedeEditar && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {isAdmin
                      ? 'Como administrador, solo puedes visualizar. No puedes editar calificaciones.'
                      : 'Este insumo ya está publicado o cerrado. No se pueden realizar cambios.'}
                  </AlertDescription>
                </Alert>
              )}

              {!isEditing ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nota Original</p>
                          <p className="text-2xl font-bold text-gray-900">{calificacion.nota_original}/10</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nota Final</p>
                          <p className="text-2xl font-bold text-red-600">{calificacion.nota_final}/10</p>
                        </div>
                      </div>

                      {calificacion.observaciones && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Observaciones</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            {calificacion.observaciones}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Calificado el:</p>
                          <p className="text-sm font-medium text-gray-500 mb-1">{formatearFecha(calificacion.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Editado el:</p>
                          <p className="text-sm font-medium text-gray-500 mb-1">{formatearFecha(calificacion.updatedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {recuperaciones.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Historial de Recuperaciones</h3>
                        <Badge variant="secondary">{recuperaciones.length}/2 intentos</Badge>
                      </div>

                      {recuperaciones.map((rec: any) => (
                        <Card key={rec.id} className="border-l-4 border-l-amber-500">
                          <CardContent className="pt-4">
                            {editandoRecuperacion === rec.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Nota de Recuperación</label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    value={notaRecuperacionEdit}
                                    onChange={(e) => setNotaRecuperacionEdit(e.target.value)}
                                    placeholder="Ej: 8.5"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Observaciones</label>
                                  <Textarea
                                    value={observacionesRecuperacionEdit}
                                    onChange={(e) => setObservacionesRecuperacionEdit(e.target.value)}
                                    placeholder="Observaciones opcionales"
                                    rows={2}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleGuardarRecuperacion(rec.id)}
                                    disabled={isUpdatingRecuperacion}
                                    size="sm"
                                  >
                                    {isUpdatingRecuperacion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={handleCancelarEditRecuperacion}
                                    disabled={isUpdatingRecuperacion}
                                    size="sm"
                                  >
                                    <X className="w-4 h-4" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge>Intento {rec.intento}</Badge>
                                    <span className="font-bold text-lg">{rec.nota_recuperacion}/10</span>
                                  </div>
                                  {puedeEditar && (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditarRecuperacion(rec)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirmarEliminarRecuperacion({ id: rec.id, intento: rec.intento })}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {rec.observaciones && (
                                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    {rec.observaciones}
                                  </p>
                                )}

                                <p className="text-xs text-gray-500">
                                  Registrado el: {formatearFecha(rec.createdAt)}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {puedeEditar && (
                    <div className="flex justify-between gap-2 pt-4 border-t">
                      <div className="flex gap-2">
                        {recuperaciones.length === 0 && (
                          <Button onClick={handleEditar} variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Nota
                          </Button>
                        )}

                        {puedeRecuperar() && (
                          <Button
                            onClick={() => setAbrirRecuperacion(true)}
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar Recuperación
                          </Button>
                        )}
                      </div>

                      <Button
                        variant="destructive"
                        onClick={() => setConfirmarEliminarCalificacion(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Calificación
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div>
                        <label className="text-sm font-medium">Nueva Nota</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={nuevaNota}
                          onChange={(e) => setNuevaNota(e.target.value)}
                          placeholder="Ej: 9.5"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium">Observaciones</label>
                        <Textarea
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Observaciones opcionales"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleGuardar} disabled={isUpdating}>
                          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          Guardar Cambios
                        </Button>
                        <Button variant="outline" onClick={handleCancelar} disabled={isUpdating}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Modal Recuperación */}
      {abrirRecuperacion && (
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

      {/* Confirmación Eliminar Calificación */}
      <AlertDialog open={confirmarEliminarCalificacion} onOpenChange={setConfirmarEliminarCalificacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              ¿Eliminar calificación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la calificación de <strong>{estudiante_nombre}</strong> y todas sus recuperaciones asociadas.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarCalificacion}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación Eliminar Recuperación */}
      <AlertDialog
        open={!!confirmarEliminarRecuperacion}
        onOpenChange={() => setConfirmarEliminarRecuperacion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              ¿Eliminar intento de recuperación?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el <strong>intento {confirmarEliminarRecuperacion?.intento}</strong> de recuperación.
              La nota final se recalculará automáticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingRecuperacion}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminarRecuperacion}
              disabled={isDeletingRecuperacion}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isDeletingRecuperacion ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}