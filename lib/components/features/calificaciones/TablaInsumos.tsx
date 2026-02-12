'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Save, Edit2, Check, X, Plus, Trash2, Lock, AlertTriangle, Info, BookOpen, Pencil, FileText, RotateCcw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
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
import { EstadoEstudiante, Role, TrimestreEstado } from '@/lib/types';
import { useReportes } from '@/lib/hooks/useReportes';
import { useQueryClient } from '@tanstack/react-query';
import { BotonReporte } from '@/lib/components/features/reportes/BotonReporte';
import { useCalificacionesBatch } from '@/lib/hooks/useCalificacionInsumo';

interface TablaInsumosProps {
  materia_curso_id: string;
  trimestre_id: string;
  estudiantes: Array<{ id: string; nombres_completos: string, estado?: string }>;
  porcentaje: number;
  trimestreEstado?: TrimestreEstado;
  materia_nombre?: string;
  trimestre_nombre?: string;
}

export function TablaInsumos({ materia_curso_id, trimestre_id, estudiantes, porcentaje, trimestreEstado, materia_nombre = '', trimestre_nombre = '' }: TablaInsumosProps) {
  const {
    insumos,
    isLoading: loadingInsumos,
    createInsumo,
    updateInsumo,
    publicarInsumo,
    deleteInsumo,
    isCreating,
    isPublicando,
    isReactivando,
    reactivarInsumo
  } = useInsumos(materia_curso_id, trimestre_id);

  const {
    calificacionesPorInsumo,
    isLoading: loadingCalificaciones,
    refetch: refetchCalificaciones
  } = useCalificacionesBatch(materia_curso_id, trimestre_id);

  const [notasTemp, setNotasTemp] = useState<Record<string, Record<string, string>>>({});
  const [editandoInsumo, setEditandoInsumo] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [guardandoInsumo, setGuardandoInsumo] = useState<string | null>(null);
  const [insumoAEliminar, setInsumoAEliminar] = useState<any | null>(null);
  const [insumoAPublicar, setInsumoAPublicar] = useState<any | null>(null);
  const [inicializado, setInicializado] = useState(false);
  const { descargarReporteInsumos } = useReportes();
  const [usuario, setUsuario] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();

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
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUsuario(parsedUser);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  const handleCrearInsumo = () => {
    const nuevoNumero = insumos.length + 1;
    if (nuevoNumero > 9) {
      toast.error('Máximo 9 insumos por trimestre');
      return;
    }

    createInsumo({ materia_curso_id, trimestre_id, nombre: `Insumo ${nuevoNumero}` });
  };

  const handleDescargarReporteInsumos = async () => {
    await descargarReporteInsumos(
      materia_curso_id,
      trimestre_id,
    );
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

    setGuardandoInsumo(insumoId);
    try {
      await calificacionInsumoService.createBatch({
        insumo_id: insumoId,
        calificaciones: estudiantesParaCrear,
      });

      queryClient.invalidateQueries({
        queryKey: ['insumos', materia_curso_id, trimestre_id]
      });

      await recargarCalificaciones();
      setNotasTemp(prev => ({ ...prev, [insumoId]: {} }));
      toast.success('Calificaciones guardadas correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar calificaciones');
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
      await refetchCalificaciones();
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

    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    const numero = parseFloat(value);

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
    await refetchCalificaciones();
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
            <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-2.5">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Aportes ({porcentaje}%)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona los insumos y calificaciones del trimestre
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {trimestreEstado === TrimestreEstado.FINALIZADO && (
              <BotonReporte
                label="Descargar Reporte"
                tooltip="Obtener PDF de aportes del trimestre"
                icon={FileText}
                variant="outline"
                className="bg-white border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold shadow-sm"
                onClick={() => descargarReporteInsumos(materia_curso_id, trimestre_id)}
                loading={false}
                disabled={isAdmin}
              />
            )}

            <Button
              onClick={handleCrearInsumo}
              disabled={isCreating || insumos.length >= 9 || isAdmin || trimestreEstado === TrimestreEstado.FINALIZADO}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Insumo
                </>
              )}
            </Button>
          </div>
        </div>
        {isAdmin && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-300 py-2">
            <ShieldCheck className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-xs">
              <strong>Modo Vista Admin:</strong> Visualización de solo lectura.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto w-full border-b border-gray-300">
          <Table className="border-collapse border-y-0 border-x-0 w-max min-w-full table-fixed">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                {/* Columna # */}
                <TableHead className="sticky left-0 z-30 bg-gray-100 text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                  #
                </TableHead>

                {/* Columna Estudiante */}
                <TableHead className="sticky left-[60px] z-30 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[380px] min-w-[380px] max-w-[380px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
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
                              <Button size="sm" variant="ghost" disabled={isAdmin} onClick={() => handleRenombrar(insumo)} className="h-6 w-6 p-0 cursor-pointer">
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              {insumos.length > 3 && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setInsumoAEliminar(insumo)}
                                  disabled={isAdmin}
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

                      {(insumo.estado === EstadoInsumo.ACTIVO || insumo.estado === EstadoInsumo.BORRADOR) && !isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleGuardarInsumo(insumo.id)}
                            disabled={guardandoInsumo === insumo.id || isAdmin}
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
                      {insumo.estado === EstadoInsumo.PUBLICADO && (
                        <Button
                          onClick={() => reactivarInsumo(insumo.id)}
                          disabled={isReactivando}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer"
                        >
                          {isReactivando ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Reactivando...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Reactivar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TableHead>
                ))}

                {/* Columna Promedio */}
                <TableHead className="bg-blue-50 text-center w-[150px] min-w-[150px] border-l-4 border-gray-400 text-blue-900 font-bold">
                  <div>Promedio</div>
                  <div className="text-xs text-blue-600 font-normal">Insumos</div>
                </TableHead>

                {/* Columna Ponderado */}
                <TableHead className="bg-blue-100 text-center w-[150px] min-w-[150px] border-l-2 border-gray-400 text-blue-900 font-bold">
                  <div>Ponderado</div>
                  <div className="text-xs text-blue-600 font-normal">({porcentaje}%)</div>
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
                    {/* Columna # */}
                    <TableCell className="sticky left-0 z-10 bg-white hover:bg-cyan-50 transition-colors text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                      {index + 1}
                    </TableCell>

                    {/* Columna Estudiante */}
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
                                    disabled={isAdmin}
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
                                disabled={guardandoInsumo === insumo.id || esInactivo || isAdmin}
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

                    {/* Columna Promedio */}
                    <TableCell className="bg-blue-50/40 text-center border-l-4 border-gray-400 font-medium w-[150px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-blue-700">
                          {promedio > 0 ? promedio.toFixed(2) : '-'}
                        </span>
                        {cualitativoPromedio && (
                          <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${getColorCualitativo(cualitativoPromedio)}`}>
                            {cualitativoPromedio}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Celda Ponderado */}
                    <TableCell className="bg-blue-100/40 text-center border-l-2 border-gray-400 font-bold text-blue-900 w-[150px]">
                      <span className="text-sm">{promedio > 0 ? ponderado : '-'}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!insumoAPublicar} onOpenChange={() => setInsumoAPublicar(null)}>
        <DialogContent className="sm:max-w-[450px]">
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

      <Dialog open={!!insumoAEliminar} onOpenChange={() => setInsumoAEliminar(null)}>
        <DialogContent className="sm:max-w-[450px]">
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