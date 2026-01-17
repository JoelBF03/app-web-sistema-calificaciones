'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Save, Edit2, Check, X, Plus, Trash2, Lock, AlertTriangle, Info, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/lib/components/ui/dialog';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { toast } from 'sonner';
import { useInsumos } from '@/lib/hooks/useInsumos';
import { calificacionInsumoService } from '@/lib/services/calificacion-insumo';
import { ModalRecuperacion } from './ModalRecuperacion';
import { ModalDetalleCalificacion } from './ModalDetalleCalificacion';
import { EstadoInsumo } from '@/lib/types/calificaciones.types';
import { calcularCualitativo, getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { EstadoEstudiante, TrimestreEstado } from '@/lib/types';

interface TablaInsumosProps {
  materia_curso_id: string;
  trimestre_id: string;
  estudiantes: Array<{ id: string; nombres_completos: string, estado?: string }>;
  porcentaje: number;
  trimestreEstado?: TrimestreEstado;
}

export function TablaInsumos({ materia_curso_id, trimestre_id, estudiantes, porcentaje }: TablaInsumosProps) {
  const {
    insumos,
    isLoading: loadingInsumos,
    createInsumo,
    updateInsumo,
    publicarInsumo,
    deleteInsumo,
    isCreating,
    isPublicando
  } = useInsumos(materia_curso_id, trimestre_id);

  const [notasTemp, setNotasTemp] = useState<Record<string, Record<string, string>>>({});
  const [editandoInsumo, setEditandoInsumo] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [calificacionesPorInsumo, setCalificacionesPorInsumo] = useState<Record<string, any[]>>({});
  const [guardandoInsumo, setGuardandoInsumo] = useState<string | null>(null);
  const [insumoAEliminar, setInsumoAEliminar] = useState<any | null>(null);
  const [insumoAPublicar, setInsumoAPublicar] = useState<any | null>(null);
  const [inicializado, setInicializado] = useState(false);

  const [modalDetalle, setModalDetalle] = useState<{
    open: boolean;
    calificacion_id: string;
    estudiante_nombre: string;
    insumo_estado: string;
  } | null>(null);

  const [modalRecuperacion, setModalRecuperacion] = useState<{
    open: boolean;
    calificacion_insumo_id: string;
    estudiante_nombre: string;
    insumo_estado: string;
  } | null>(null);

  useEffect(() => {
    if (!loadingInsumos && insumos.length === 0 && !inicializado) {
      for (let i = 1; i <= 3; i++) {
        createInsumo({ materia_curso_id, trimestre_id, nombre: `Insumo ${i}` });
      }
      setInicializado(true);
    }
  }, [loadingInsumos, insumos.length, inicializado]);

  useEffect(() => {
    const cargarCalificaciones = async () => {
      for (const insumo of insumos) {
        try {
          const cals = await calificacionInsumoService.getByInsumo(insumo.id);
          setCalificacionesPorInsumo(prev => ({ ...prev, [insumo.id]: cals }));
        } catch (error) {
          console.error(`Error cargando calificaciones del insumo ${insumo.id}:`, error);
        }
      }
    };

    if (insumos.length > 0) {
      cargarCalificaciones();
    }
  }, [insumos]);

  const handleCrearInsumo = () => {
    const nuevoNumero = insumos.length + 1;
    if (nuevoNumero > 9) {
      toast.error('Máximo 9 insumos por trimestre');
      return;
    }

    const insumosPublicados = insumos.filter(i => i.estado === EstadoInsumo.PUBLICADO).length;
    if (insumosPublicados < 3) {
      toast.error('Debes publicar los 3 primeros insumos antes de crear más');
      return;
    }

    createInsumo({ materia_curso_id, trimestre_id, nombre: `Insumo ${nuevoNumero}` });
  };

  const calcularPonderado = (promedio: number) => {
    return (promedio * (porcentaje / 100)).toFixed(2);
  };

  const handleGuardarInsumo = async (insumoId: string) => {
    const notasInsumo = notasTemp[insumoId] || {};
    const calificacionesExistentes = calificacionesPorInsumo[insumoId] || [];

    const estudiantesParaCrear: any[] = [];

    estudiantes.forEach(est => {
      const notaStr = notasInsumo[est.id];
      if (!notaStr || notaStr.trim() === '') return;

      const nota = parseFloat(notaStr);
      if (isNaN(nota) || nota < 0 || nota > 10) return;

      const calExistente = calificacionesExistentes.find((c: any) => c.estudiante_id === est.id);

      if (!calExistente) {
        estudiantesParaCrear.push({
          estudiante_id: est.id,
          nota: nota
        });
      }
    });

    if (estudiantesParaCrear.length === 0) {
      toast.error('No hay calificaciones nuevas para guardar');
      return;
    }

    try {
      setGuardandoInsumo(insumoId);

      await calificacionInsumoService.createBatch({ insumo_id: insumoId, calificaciones: estudiantesParaCrear });

      const cals = await calificacionInsumoService.getByInsumo(insumoId);
      setCalificacionesPorInsumo(prev => ({ ...prev, [insumoId]: cals }));

      setNotasTemp(prev => ({ ...prev, [insumoId]: {} }));

      toast.success(`${estudiantesParaCrear.length} calificaciones guardadas`);
    } catch (error: any) {
      console.error('Error completo:', error);
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setGuardandoInsumo(null);
    }
  };

  const abrirModalPublicar = (insumo: any) => {
    const cals = calificacionesPorInsumo[insumo.id] || [];

    const estudiantesActivos = estudiantes.filter(est => est.estado !== 'INACTIVO_TEMPORAL');
    const faltantes = estudiantesActivos.filter(est => !cals.some((c: any) => c.estudiante_id === est.id));

    if (faltantes.length > 0) {
      toast.error(`Faltan calificaciones para: ${faltantes.map(e => e.nombres_completos).join(', ')}`);
      return;
    }

    setInsumoAPublicar(insumo);
  };

  const confirmarPublicar = async () => {
    if (!insumoAPublicar) return;

    try {
      await publicarInsumo(insumoAPublicar.id);
      const cals = await calificacionInsumoService.getByInsumo(insumoAPublicar.id);
      setCalificacionesPorInsumo(prev => ({ ...prev, [insumoAPublicar.id]: cals }));
      setInsumoAPublicar(null);
      toast.success('Insumo publicado y bloqueado correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al publicar');
    }
  };

  const handleEliminarInsumo = async () => {
    if (!insumoAEliminar) return;

    try {
      await deleteInsumo(insumoAEliminar.id);

      setCalificacionesPorInsumo(prev => {
        const newState = { ...prev };
        delete newState[insumoAEliminar.id];
        return newState;
      });

      setNotasTemp(prev => {
        const newState = { ...prev };
        delete newState[insumoAEliminar.id];
        return newState;
      });

      setInsumoAEliminar(null);
      toast.success('Insumo eliminado correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleRenombrar = (insumo: any) => {
    setEditandoInsumo(insumo.id);
    setNuevoNombre(insumo.nombre);
  };

  const handleGuardarNombre = (insumoId: string) => {
    if (nuevoNombre.trim()) {
      updateInsumo({ id: insumoId, data: { nombre: nuevoNombre.trim() } });
      setEditandoInsumo(null);
    }
  };

  const handleNotaChange = (insumoId: string, estudianteId: string, value: string) => {
    if (value === '') {
      setNotasTemp(prev => ({
        ...prev,
        [insumoId]: { ...prev[insumoId], [estudianteId]: '' }
      }));
      return;
    }

    // Validar formato: solo números y punto decimal
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return; // No permitir más de 2 decimales
    }

    const numero = parseFloat(value);

    // Si hay un número válido, validar rango
    if (!isNaN(numero)) {
      if (numero < 0 || numero > 10) return;
    }

    setNotasTemp(prev => ({
      ...prev,
      [insumoId]: { ...prev[insumoId], [estudianteId]: value }
    }));
  };

  const calcularPromedio = (estudianteId: string) => {
    let suma = 0;
    let count = 0;

    insumos.forEach(insumo => {
      const cals = calificacionesPorInsumo[insumo.id] || [];
      const cal = cals.find((c: any) => c.estudiante_id === estudianteId);

      if (cal && cal.nota_final !== null && cal.nota_final !== undefined) {
        suma += Number(cal.nota_final);
        count++;
      }
    });

    return count > 0 ? (suma / count) : 0;
  };

  const abrirModalDetalle = (calificacion_id: string, estudiante_nombre: string, insumo_estado: string) => {
    setModalDetalle({
      open: true,
      calificacion_id,
      estudiante_nombre,
      insumo_estado
    });
  };

  const abrirModalRecuperacion = (calificacion_insumo_id: string, estudiante_nombre: string, insumo_estado: string) => {
    setModalRecuperacion({
      open: true,
      calificacion_insumo_id,
      estudiante_nombre,
      insumo_estado
    });
  };

  const cerrarModalDetalle = () => {
    setModalDetalle(null);
  };

  const cerrarModalRecuperacion = () => {
    setModalRecuperacion(null);
  };

  const recargarCalificaciones = async () => {
    for (const insumo of insumos) {
      try {
        const cals = await calificacionInsumoService.getByInsumo(insumo.id);
        setCalificacionesPorInsumo(prev => ({ ...prev, [insumo.id]: cals }));
      } catch (error) {
        console.error(`Error recargando calificaciones del insumo ${insumo.id}:`, error);
      }
    }
  };

  if (loadingInsumos) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-2">
              <BookOpen className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Calificaciones de Insumos
              </h3>
              <p className="text-sm text-gray-600">Ponderación: {porcentaje}%</p>
            </div>
          </div>
          <Button
            onClick={handleCrearInsumo}
            disabled={isCreating || insumos.length >= 9}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            size="sm"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Crear Insumo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Tabla principal con scroll */}
        <div className="overflow-x-auto">
          <Table className="border-collapse border-2 border-gray-400">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                {/* Columna # - sticky con borde permanente */}
                <TableHead className="sticky left-0 z-20 bg-gray-100 text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                  #
                </TableHead>

                {/* Columna Estudiante - sticky con más ancho y borde permanente */}
                <TableHead className="sticky left-[60px] z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[380px] min-w-[380px] max-w-[380px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                  Estudiante
                </TableHead>

                {/* Columnas de Insumos */}
                {insumos.map((insumo) => (
                  <TableHead key={insumo.id} className="border-x-2 border-gray-400 px-3 py-3 text-center w-[200px] min-w-[200px] max-w-[200px] bg-gray-50">
                    <div className="space-y-2">
                      {editandoInsumo === insumo.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            className="text-sm h-8 border-2 border-gray-500"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleGuardarNombre(insumo.id)} className="h-8 w-8 p-0 cursor-pointer">
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditandoInsumo(null)} className="h-8 w-8 p-0 cursor-pointer">
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold text-sm truncate max-w-[120px] text-gray-900" title={insumo.nombre}>
                            {insumo.nombre}
                          </span>
                          {(insumo.estado === EstadoInsumo.BORRADOR || insumo.estado === EstadoInsumo.ACTIVO) && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleRenombrar(insumo)} className="h-6 w-6 p-0 cursor-pointer">
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              {insumos.length > 3 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setInsumoAEliminar(insumo)}
                                  className="text-red-600 hover:text-red-700 h-6 w-6 p-0 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-1">
                        {insumo.estado === EstadoInsumo.BORRADOR && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold">Borrador</span>
                        )}
                        {insumo.estado === EstadoInsumo.ACTIVO && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">Activo</span>
                        )}
                        {insumo.estado === EstadoInsumo.PUBLICADO && (
                          <>
                            <Lock className="w-3 h-3 text-green-600" />
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">Publicado</span>
                          </>
                        )}
                        {insumo.estado === EstadoInsumo.CERRADO && (
                          <>
                            <Lock className="w-3 h-3 text-gray-600" />
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold">Cerrado</span>
                          </>
                        )}
                      </div>

                      {(insumo.estado === EstadoInsumo.ACTIVO || insumo.estado === EstadoInsumo.BORRADOR) && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleGuardarInsumo(insumo.id)}
                            disabled={guardandoInsumo === insumo.id}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-7 cursor-pointer"
                          >
                            {guardandoInsumo === insumo.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => abrirModalPublicar(insumo)}
                            disabled={isPublicando}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-7 cursor-pointer"
                          >
                            {isPublicando ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}

                {/* Columna Promedio */}
                <TableHead className="border-x-2 border-gray-400 px-4 py-3 text-center bg-blue-50 min-w-[120px] font-semibold text-gray-900">
                  <div>Promedio</div>
                  <div className="text-xs text-gray-600 font-normal">Insumos</div>
                </TableHead>

                {/* Columna Ponderado */}
                <TableHead className="border-l-2 border-gray-400 px-4 py-3 text-center bg-blue-100 min-w-[100px] font-semibold text-gray-900">
                  <div>Ponderado</div>
                  <div className="text-xs text-gray-600 font-normal">({porcentaje}%)</div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {estudiantes.map((estudiante, index) => {
                const esInactivo = estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL;
                const promedio = calcularPromedio(estudiante.id);
                const ponderado = calcularPonderado(promedio);
                const cualitativoPromedio = promedio > 0 ? calcularCualitativo(promedio) : '';

                return (
                  <TableRow key={estudiante.id} className={`hover:bg-cyan-50 transition-colors border-b border-gray-300 ${esInactivo ? 'bg-gray-100 opacity-60' : ''}`}>
                    {/* Columna # - sticky con borde permanente */}
                    <TableCell className="sticky left-0 z-10 bg-white hover:bg-cyan-50 transition-colors text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                      {index + 1}
                    </TableCell>

                    {/* Columna Estudiante - sticky con borde permanente */}
                    <TableCell className="sticky left-[60px] z-10 bg-white hover:bg-cyan-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] font-medium px-4 border-r-2 border-gray-400">
                      <span className="text-sm">{estudiante.nombres_completos}</span>
                    </TableCell>

                    {/* Columnas de notas por insumo */}
                    {insumos.map((insumo) => {
                      const notaTemp = notasTemp[insumo.id]?.[estudiante.id] || '';
                      const cals = calificacionesPorInsumo[insumo.id] || [];
                      const cal = cals.find((c: any) => c.estudiante_id === estudiante.id);

                      if (cal) {
                        const notaFinal = Number(cal.nota_final);
                        const necesitaRecuperacion = notaFinal < 7;

                        return (
                          <TableCell key={insumo.id} className="border-x border-gray-300 px-2 py-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`font-bold text-sm ${notaFinal >= 7 ? 'text-green-700' :
                                notaFinal >= 4 ? 'text-yellow-700' : 'text-red-700'
                                }`}>
                                {notaFinal.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1">
                                {necesitaRecuperacion && insumo.estado === EstadoInsumo.ACTIVO && (
                                  <button
                                    onClick={() => abrirModalRecuperacion(cal.id, estudiante.nombres_completos, insumo.estado)}
                                    className="text-yellow-600 hover:text-yellow-700 transition-colors p-1 cursor-pointer"
                                    title="Recuperación"
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => abrirModalDetalle(cal.id, estudiante.nombres_completos, insumo.estado)}
                                  className="text-blue-600 hover:text-blue-700 transition-colors p-1 cursor-pointer"
                                  title="Ver detalles"
                                >
                                  <Info className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </TableCell>
                        );
                      } else {
                        if (insumo.estado === EstadoInsumo.BORRADOR || insumo.estado === EstadoInsumo.ACTIVO) {
                          const notaNum = notaTemp ? parseFloat(notaTemp) : null;
                          const esValida = notaNum !== null && !isNaN(notaNum);

                          return (
                            <TableCell key={insumo.id} className="border-x border-gray-300 px-2 py-2 text-center">
                              <Input
                                type="text"
                                inputMode="decimal"
                                disabled={esInactivo}
                                value={notaTemp}
                                onChange={(e) => handleNotaChange(insumo.id, estudiante.id, e.target.value)}
                                placeholder="0.00"
                                className={`w-full text-center border-2 ${esValida
                                  ? notaNum >= 7
                                    ? 'border-green-600 bg-green-50 text-green-700 font-bold focus-visible:ring-green-500' :
                                    notaNum >= 4
                                      ? 'border-yellow-600 bg-yellow-50 text-yellow-700 font-bold focus-visible:ring-yellow-500' :
                                      'border-red-600 bg-red-50 text-red-700 font-bold focus-visible:ring-red-500'
                                  : 'border-gray-500'
                                  }`}
                              />
                            </TableCell>
                          );
                        } else {
                          return (
                            <TableCell key={insumo.id} className="border-x border-gray-300 px-2 py-2 text-center">
                              <span className="text-gray-400">-</span>
                            </TableCell>
                          );
                        }
                      }
                    })}

                    {/* Columna Promedio CON cualitativo */}
                    <TableCell className="border-x border-gray-300 px-3 py-2 text-center bg-blue-50">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-blue-700">
                          {promedio > 0 ? promedio.toFixed(2) : '-'}
                        </span>
                        {cualitativoPromedio && (
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${getColorCualitativo(cualitativoPromedio)}`}>
                            {cualitativoPromedio}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Columna Ponderado */}
                    <TableCell className="border-l-2 border-gray-400 px-3 py-2 text-center font-bold text-blue-800 bg-blue-100">
                      <span className="text-sm">{promedio > 0 ? ponderado : '-'}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal Confirmar Publicación */}
      <Dialog open={!!insumoAPublicar} onOpenChange={() => setInsumoAPublicar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar y Bloquear Insumo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas publicar <strong>{insumoAPublicar?.nombre}</strong>?
            </DialogDescription>
          </DialogHeader>
          <Alert className="bg-yellow-50 border-yellow-200">
            <Lock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Una vez publicado, este insumo quedará <strong>bloqueado</strong> y no podrás modificar las calificaciones.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInsumoAPublicar(null)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarPublicar}
              className="bg-green-600 hover:bg-green-700"
            >
              <Lock className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar Insumo */}
      <Dialog open={!!insumoAEliminar} onOpenChange={() => setInsumoAEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Insumo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar <strong>{insumoAEliminar?.nombre}</strong>?
            </DialogDescription>
          </DialogHeader>
          {insumoAEliminar && calificacionesPorInsumo[insumoAEliminar.id]?.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este insumo tiene {calificacionesPorInsumo[insumoAEliminar.id].length} calificaciones registradas que también serán eliminadas.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInsumoAEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleEliminarInsumo}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modalDetalle && (
        <ModalDetalleCalificacion
          calificacion_id={modalDetalle.calificacion_id}
          estudiante_nombre={modalDetalle.estudiante_nombre}
          insumo_estado={modalDetalle.insumo_estado}
          open={modalDetalle.open}
          onClose={cerrarModalDetalle}
          onSuccess={recargarCalificaciones}
        />
      )}

      {modalRecuperacion && (
        <ModalRecuperacion
          calificacion_insumo_id={modalRecuperacion.calificacion_insumo_id}
          estudiante_nombre={modalRecuperacion.estudiante_nombre}
          insumo_estado={modalRecuperacion.insumo_estado}
          open={modalRecuperacion.open}
          onClose={cerrarModalRecuperacion}
          onSuccess={recargarCalificaciones}
        />
      )}
    </Card>
  );
}