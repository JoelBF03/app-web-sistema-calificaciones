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
import { calcularCualitativo, getColorCualitativo } from '@/lib/utils/calificaciones.utils';

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
  
  const puedeEditar = estadoSupletorio === EstadoSupletorio.ACTIVADO;
  const supletoriosCerrados = estadoSupletorio === EstadoSupletorio.CERRADO;

  useEffect(() => {
    if (open) {
      cargarPromedio();
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
    if (isNaN(nota) || nota < 0 || nota > 10) {
      toast.error('La nota debe estar entre 0 y 10');
      return;
    }

    setMostrarConfirmacion(true);
  };

  const handleGuardar = async () => {
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

  const calcularPromedioFinal = (promedioAnual: number, notaSupletorio: number) => {
    const promedio = (promedioAnual + notaSupletorio) / 2;
    return promedio >= 7.0 ? 7.0 : promedio;
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
            {/* Alertas de estado */}
            {supletoriosCerrados && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Lock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Período de supletorios cerrado.</strong> Solo puedes editar mediante este modal de detalle.
                </AlertDescription>
              </Alert>
            )}

            {!puedeEditar && !supletoriosCerrados && (
              <Alert className="bg-gray-50 border-gray-200">
                <Info className="h-4 w-4 text-gray-600" />
                <AlertDescription className="text-gray-800">
                  Los supletorios no están activos. No se pueden realizar cambios.
                </AlertDescription>
              </Alert>
            )}

            {/* Información del Promedio Anual */}
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
                <div className="bg-white p-2 rounded border border-red-300">
                  <p className="text-gray-600">Promedio Anual</p>
                  <p className="font-bold text-xl text-red-700">{parseFloat(promedio.promedio_anual as any).toFixed(2)}</p>
                  <Badge className={`mt-1 ${getColorCualitativo(promedio.cualitativa_anual)}`}>
                    {promedio.cualitativa_anual}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sección de Nota de Supletorio */}
            <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <BookCheck className="h-4 w-4" />
                Examen Supletorio
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nota">Nota de Supletorio (0 - 10)</Label>
                    <Input
                      id="nota"
                      type="text"
                      value={nuevaNota}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                          const num = parseFloat(value);
                          if (value === '' || (!isNaN(num) && num >= 0 && num <= 10)) {
                            setNuevaNota(value);
                          }
                        }
                      }}
                      placeholder="Ej: 8.50"
                      className="mt-1 text-lg font-semibold"
                      disabled={isSaving}
                    />
                  </div>

                  {nuevaNota && !isNaN(parseFloat(nuevaNota)) && (
                    <Alert className="bg-green-50 border-green-200">
                      <Info className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        <p className="text-sm text-green-800 mb-2"><strong>Vista Previa del Cálculo:</strong></p>
                        <div className="text-sm space-y-1 text-green-700">
                          <p>• Promedio Anual: <strong>{parseFloat(promedio.promedio_anual as any).toFixed(2)}</strong></p>
                          <p>• Nota Supletorio: <strong>{parseFloat(nuevaNota).toFixed(2)}</strong></p>
                          <p>• Cálculo: <strong>({parseFloat(promedio.promedio_anual as any).toFixed(2)} + {parseFloat(nuevaNota).toFixed(2)}) / 2 = {((parseFloat(promedio.promedio_anual as any) + parseFloat(nuevaNota)) / 2).toFixed(2)}</strong></p>
                          <p className="pt-2 font-bold text-base">
                            → Promedio Final: <span className="text-green-900">{calcularPromedioFinal(parseFloat(promedio.promedio_anual as any), parseFloat(nuevaNota)).toFixed(2)}</span>
                            {((parseFloat(promedio.promedio_anual as any) + parseFloat(nuevaNota)) / 2) >= 7.0 && (
                              <span className="text-xs ml-2">(Tope aplicado: 7.00)</span>
                            )}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

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
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
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

                      <div className="bg-white p-3 rounded border border-gray-300">
                        <p className="text-sm text-gray-600 mb-2">Estado Final</p>
                        <Badge className={
                          promedio.estado === 'APROBADO' 
                            ? 'bg-green-100 text-green-800 text-sm' 
                            : 'bg-red-100 text-red-800 text-sm'
                        }>
                          {promedio.estado === 'APROBADO' ? '✅ APROBADO' : '❌ REPROBADO'}
                        </Badge>
                      </div>

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

                      {supletoriosCerrados && (
                        <Button
                          onClick={handleEditar}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Corregir Nota (Modo Detalle)
                        </Button>
                      )}
                    </>
                  ) : (
                    <Alert className="bg-gray-50 border-gray-200">
                      <Info className="h-4 w-4 text-gray-600" />
                      <AlertDescription className="text-gray-700">
                        No se ha registrado nota de supletorio aún.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Información de Auditoría */}
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

        {/* Modal de Confirmación */}
        {mostrarConfirmacion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Confirmar Cambio
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que deseas {promedio.nota_supletorio !== null ? 'actualizar' : 'registrar'} 
                la nota de supletorio a <strong>{parseFloat(nuevaNota).toFixed(2)}</strong>?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfirmacion(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardar}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
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