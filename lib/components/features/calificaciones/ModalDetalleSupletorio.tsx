'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/lib/components/ui/dialog';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Badge } from '@/lib/components/ui/badge';
import { Separator } from '@/lib/components/ui/separator';
import { Loader2, Info, Edit, X, Save, AlertTriangle, BookCheck, TrendingUp, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { promediosPeriodoService } from '@/lib/services/promedio-periodo';
import { EstadoSupletorio } from '@/lib/types/periodo.types';
import { getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { EstadoPromedioAnual } from '@/lib/types/calificaciones.types';

interface ModalDetalleSupletorioProps {
  promedio_id: string;
  estudiante_nombre: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estadoSupletorio: EstadoSupletorio;
}

export function ModalDetalleSupletorio({
  promedio_id,
  estudiante_nombre,
  open,
  onClose,
  onSuccess,
  estadoSupletorio
}: ModalDetalleSupletorioProps) {
  const [promedio, setPromedio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  
  // 🔥 CONTROL: Solo permitir edición cuando esté ACTIVADO
  const puedeEditar = estadoSupletorio === EstadoSupletorio.ACTIVADO;
  const supletoriosCerrados = estadoSupletorio === EstadoSupletorio.CERRADO;
  const supletoriosPendientes = estadoSupletorio === EstadoSupletorio.PENDIENTE;

  useEffect(() => {
    if (open) {
      cargarPromedio();
      // Resetear modo edición al abrir
      setIsEditing(false);
    }
  }, [open, promedio_id]);

  const cargarPromedio = async () => {
    try {
      setIsLoading(true);
      const data = await promediosPeriodoService.getById(promedio_id);
      setPromedio(data);
      setNuevaNota(data.nota_supletorio?.toString() || '');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar promedio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditar = () => {
    // 🔥 Doble validación antes de permitir edición
    if (!puedeEditar) {
      toast.error('No puedes editar. Los supletorios deben estar ACTIVADOS.');
      return;
    }
    setIsEditing(true);
  };

  const handleCancelar = () => {
    setNuevaNota(promedio.nota_supletorio?.toString() || '');
    setIsEditing(false);
  };

  const handleSolicitarGuardar = () => {
    if (!nuevaNota || nuevaNota.trim() === '') {
      toast.error('Debes ingresar una nota');
      return;
    }

    const nota = parseFloat(nuevaNota);
    if (isNaN(nota) || nota < 0 || nota > 7.00) {
      toast.error('La nota debe estar entre 0 y 7.00');
      return;
    }

    setMostrarConfirmacion(true);
  };

  const handleGuardar = async () => {
    // 🔥 Validación extra antes de enviar al backend
    if (!puedeEditar) {
      toast.error('No puedes guardar. Los supletorios deben estar ACTIVADOS.');
      setMostrarConfirmacion(false);
      return;
    }

    try {
      setIsSaving(true);
      setMostrarConfirmacion(false);
      
      const nota = parseFloat(nuevaNota);
      await promediosPeriodoService.registrarSupletorio(promedio_id, {
        nota_supletorio: nota
      });

      toast.success('Calificación de supletorio actualizada correctamente');
      setIsEditing(false);
      await cargarPromedio();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setIsSaving(false);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookCheck className="h-5 w-5 text-orange-600" />
            Detalle de Supletorio
          </DialogTitle>
          <DialogDescription>
            Estudiante: <strong>{estudiante_nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="space-y-6">

            {/* 🔥 ALERTA: Estado PENDIENTE - No disponible */}
            {supletoriosPendientes && (
              <Alert className="bg-gray-50 border-2 border-gray-300">
                <Info className="h-5 w-5 text-gray-600" />
                <AlertDescription className="text-gray-800">
                  <p className="font-semibold">Supletorios PENDIENTES</p>
                  <p className="text-sm mt-1">
                    El administrador debe activar la fase de supletorios primero.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Promedio Anual (3 Trimestres)
              </h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Trimestre 1</p>
                  <p className="font-semibold text-lg">{parseFloat(promedio.nota_trimestre_1 as any).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trimestre 2</p>
                  <p className="font-semibold text-lg">{parseFloat(promedio.nota_trimestre_2 as any).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trimestre 3</p>
                  <p className="font-semibold text-lg">{parseFloat(promedio.nota_trimestre_3 as any).toFixed(2)}</p>
                </div>
                <div className="bg-white p-2 rounded border border-red-300 text-center">
                  <p className="text-gray-600">Anual</p>
                  <p className="font-bold text-xl text-red-700">{parseFloat(promedio.promedio_anual as any).toFixed(2)}</p>
                  <Badge className={`mt-1 ${getColorCualitativo(promedio.cualitativa_anual)}`}>
                    {promedio.cualitativa_anual}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <BookCheck className="h-4 w-4" />
                Examen Supletorio
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nota">Nota de Supletorio (0.00 - 7.00)</Label>
                    <Input
                      id="nota"
                      type="text"
                      value={nuevaNota}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          const num = parseFloat(value);
                          if (value === '' || (!isNaN(num) && num >= 0 && num <= 7.00)) {
                            setNuevaNota(value);
                          }
                        }
                      }}
                      placeholder="0.00"
                      className="mt-1 text-lg font-semibold"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-orange-600 mt-1">* La nota máxima permitida es 7.00</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelar}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSolicitarGuardar}
                      disabled={isSaving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Guardar Cambios
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {promedio.nota_supletorio !== null ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded border border-orange-300">
                          <p className="text-sm text-gray-600">Nota Supletorio</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {parseFloat(promedio.nota_supletorio as any).toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded border border-green-300">
                          <p className="text-sm text-gray-600">Promedio Final</p>
                          <p className="text-2xl font-bold text-green-700">
                            {parseFloat(promedio.promedio_final as any).toFixed(2)}
                          </p>
                          <Badge className={`mt-1 ${getColorCualitativo(promedio.cualitativa_final)}`}>
                            {promedio.cualitativa_final}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-300 text-center">
                        <p className="text-sm text-gray-600 mb-2">Estado Final</p>
                        <Badge className={
                          promedio.estado === EstadoPromedioAnual.APROBADO
                            ? 'bg-green-100 text-green-800 text-sm' 
                            : 'bg-red-100 text-red-800 text-sm'
                        }>
                          {promedio.estado === EstadoPromedioAnual.APROBADO ? EstadoPromedioAnual.APROBADO : EstadoPromedioAnual.REPROBADO}
                        </Badge>
                      </div>

                      {/* 🔥 SOLO MOSTRAR BOTÓN DE EDITAR SI EL ESTADO ES ACTIVADO */}
                      {puedeEditar && (
                        <Button
                          onClick={handleEditar}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Nota
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Alert className="bg-gray-50 border-gray-200">
                        <Info className="h-4 w-4 text-gray-600" />
                        <AlertDescription className="text-gray-700">
                          No se ha registrado nota de supletorio aún.
                        </AlertDescription>
                      </Alert>

                      {/* 🔥 Si está PENDIENTE o CERRADO, explicar por qué no hay botón */}
                      {!puedeEditar && (
                        <Alert className="bg-red-50 border-red-200">
                          <Lock className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            {supletoriosCerrados && (
                              <p>El período de supletorios está <strong>CERRADO</strong>. No se puede registrar la nota.</p>
                            )}
                            {supletoriosPendientes && (
                              <p>Los supletorios están <strong>PENDIENTES</strong> de activación.</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {promedio.createdAt && (
              <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
                <p><strong>Creado:</strong> {formatearFecha(promedio.createdAt)}</p>
                {promedio.updatedAt && promedio.updatedAt !== promedio.createdAt && (
                  <p><strong>Última modificación:</strong> {formatearFecha(promedio.updatedAt)}</p>
                )}
              </div>
            )}
          </div>
        )}

        {mostrarConfirmacion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Confirmar Cambio
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que deseas {promedio.nota_supletorio !== null ? 'actualizar' : 'registrar'} 
                la nota de supletorio a <strong>{parseFloat(nuevaNota).toFixed(2)}</strong>?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMostrarConfirmacion(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleGuardar} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}