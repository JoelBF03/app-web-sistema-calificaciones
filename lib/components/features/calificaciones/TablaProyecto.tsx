'use client';

import { useState } from 'react';
import { Loader2, Save, Eye, AlertCircle, Info } from 'lucide-react';
import { useCalificacionProyecto } from '@/lib/hooks/useCalificacionProyecto';
import { ModalDetalleProyecto } from './ModalDetalleProyecto';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { toast } from 'sonner';
import { calcularCualitativo, getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { EstadoEstudiante, TrimestreEstado } from '@/lib/types';

interface TablaProyectoProps {
  curso_id: string;
  trimestre_id: string;
  estudiantes: Array<{ id: string; nombres_completos: string, estado?: string }>;
  isTutor: boolean;
  porcentaje: number;
  trimestreEstado?: TrimestreEstado;
}

export function TablaProyecto({ curso_id, trimestre_id, estudiantes, isTutor, porcentaje, trimestreEstado }: TablaProyectoProps) {
  const {
    calificaciones,
    isLoading,
    guardarCalificaciones,
    updateCalificacion,
    isSaving,
    isUpdating,
    refetch
  } = useCalificacionProyecto(curso_id, trimestre_id, isTutor);

  const estadoFinalizado = trimestreEstado === TrimestreEstado.FINALIZADO;
  const trimestreActivo = trimestreEstado === TrimestreEstado.ACTIVO;
  const [notasTemp, setNotasTemp] = useState<Record<string, string>>({});
  const [modalDetalle, setModalDetalle] = useState<{
    open: boolean;
    calificacion_id: string;
    estudiante_nombre: string;
    trimestreEstado?: TrimestreEstado;
  } | null>(null);

  const handleGuardar = async () => {
    if (!isTutor) {
      toast.error('Solo el tutor puede calificar el proyecto integrador');
      return;
    }

    const estudiantesParaCrear: any[] = [];
    const estudiantesParaActualizar: any[] = [];

    estudiantes.forEach(est => {
      const notaStr = notasTemp[est.id];
      if (!notaStr || notaStr.trim() === '') return;

      const nota = parseFloat(notaStr);
      if (isNaN(nota) || nota < 0 || nota > 10) return;

      const calExistente = calificaciones.find((c: any) => c.estudiante_id === est.id);

      if (calExistente) {
        const notaExistente = Number(calExistente.calificacion_proyecto);
        if (Math.abs(notaExistente - nota) > 0.001) {
          estudiantesParaActualizar.push({
            id: calExistente.id,
            estudiante_id: est.id,
            calificacion_proyecto: nota
          });
        }
      } else {
        estudiantesParaCrear.push({
          estudiante_id: est.id,
          calificacion_proyecto: nota
        });
      }
    });

    if (estudiantesParaCrear.length === 0 && estudiantesParaActualizar.length === 0) {
      toast.error('No hay calificaciones nuevas o modificadas');
      return;
    }

    if (estudiantesParaCrear.length > 0) {
      guardarCalificaciones({
        curso_id,
        trimestre_id,
        calificaciones: estudiantesParaCrear
      });
    }

    for (const update of estudiantesParaActualizar) {
      updateCalificacion({
        id: update.id,
        data: { calificacion_proyecto: update.calificacion_proyecto }
      });
    }

    setNotasTemp({});
  };

  const handleNotaChange = (estudianteId: string, value: string) => {
    if (value === '') {
      setNotasTemp(prev => ({ ...prev, [estudianteId]: '' }));
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    const numero = parseFloat(value);
    if (!isNaN(numero) && (numero < 0 || numero > 10)) return;

    setNotasTemp(prev => ({ ...prev, [estudianteId]: value }));
  };

  const calcularPonderado = (nota: number) => {
    return (nota * (porcentaje / 100)).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!isTutor) {
    return (
      <div className="space-y-4">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Solo el tutor del curso puede editar las calificaciones del proyecto integrador.
          </AlertDescription>
        </Alert>

        <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                <TableHead className="sticky left-0 z-20 bg-gray-100 text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                  #
                </TableHead>
                <TableHead className="sticky left-[60px] z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[380px] min-w-[380px] max-w-[380px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                  Estudiante
                </TableHead>
                <TableHead className="border-x-2 border-gray-400 text-center w-[200px] min-w-[200px] font-semibold text-gray-900">
                  Nota Proyecto
                </TableHead>
                <TableHead className="border-x-2 border-gray-400 text-center bg-blue-50 w-[100px] min-w-[100px] font-semibold text-gray-900">
                  <div>Ponderado</div>
                  <div className="text-xs text-gray-600 font-normal">({porcentaje}%)</div>
                </TableHead>
                <TableHead className="border-l-2 border-gray-400 text-center w-[200px] min-w-[200px] font-semibold text-gray-900">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estudiantes.map((estudiante, index) => {
                const esInactivo = estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL;
                const calExistente = calificaciones.find((c: any) => c.estudiante_id === estudiante.id);
                const notaGuardada = calExistente?.calificacion_proyecto;
                const ponderado = notaGuardada ? calcularPonderado(Number(notaGuardada)) : '-';
                const cualitativo = notaGuardada ? calcularCualitativo(Number(notaGuardada)) : null;

                return (
                  <TableRow key={estudiante.id} className={`hover:bg-cyan-50 transition-colors border-b border-gray-300 ${esInactivo ? 'bg-gray-100 opacity-60' : ''}`}>
                    <TableCell className="sticky left-0 z-10 bg-white hover:bg-cyan-50 transition-colors text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                      {index + 1}
                    </TableCell>
                    <TableCell className="sticky left-[60px] z-10 bg-white hover:bg-cyan-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] font-medium px-4 border-r-2 border-gray-400">
                      {estudiante.nombres_completos}
                    </TableCell>
                    <TableCell className="border-x border-gray-300 text-center px-2 py-2">
                      {notaGuardada !== null && notaGuardada !== undefined ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-semibold text-lg ${Number(notaGuardada) >= 7 ? 'text-green-700' :
                            Number(notaGuardada) >= 4 ? 'text-yellow-700' :
                              'text-red-700'
                            }`}>
                            {Number(notaGuardada).toFixed(2)}
                          </span>
                          {cualitativo && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getColorCualitativo(cualitativo)}`}>
                              {cualitativo}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin calificación</span>
                      )}
                    </TableCell>
                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-blue-50 px-3 py-2">
                      {ponderado}
                    </TableCell>
                    <TableCell className="border-l-2 border-gray-400 text-center px-2 py-2">
                      {calExistente ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setModalDetalle({
                            open: true,
                            calificacion_id: calExistente.id,
                            estudiante_nombre: estudiante.nombres_completos,
                            trimestreEstado
                          })}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin calificación</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {modalDetalle && (
          <ModalDetalleProyecto
            calificacion_id={modalDetalle.calificacion_id}
            estudiante_nombre={modalDetalle.estudiante_nombre}
            isTutor={false}
            open={modalDetalle.open}
            onClose={() => setModalDetalle(null)}
            onSuccess={() => { }}
            trimestreEstado={modalDetalle.trimestreEstado}
          />
        )}
      </div>
    );
  }

  const hayCalificaciones = calificaciones.length > 0;

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Eres el tutor de este curso.</strong> Para calificar o editar el Proyecto Integrador,
          dirígete al <strong>Módulo de Tutoría</strong> desde el dashboard principal.
        </AlertDescription>
      </Alert>

      <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-400">
              <TableHead className="sticky left-0 z-20 bg-gray-100 text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                #
              </TableHead>
              <TableHead className="sticky left-[60px] z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[380px] min-w-[380px] max-w-[380px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                Estudiante
              </TableHead>
              <TableHead className="border-x-2 border-gray-400 text-center w-[200px] min-w-[200px] font-semibold text-gray-900">
                Nota Proyecto
              </TableHead>
              <TableHead className="border-x-2 border-gray-400 text-center bg-blue-50 w-[100px] min-w-[100px] font-semibold text-gray-900">
                <div>Ponderado</div>
                <div className="text-xs text-gray-600 font-normal">({porcentaje}%)</div>
              </TableHead>
              <TableHead className="border-l-2 border-gray-400 text-center w-[200px] min-w-[200px] font-semibold text-gray-900">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {estudiantes.map((estudiante, index) => {
              const calExistente = calificaciones.find((c: any) => c.estudiante_id === estudiante.id);
              const notaGuardada = calExistente?.calificacion_proyecto;
              const ponderado = notaGuardada ? calcularPonderado(Number(notaGuardada)) : '-';
              const cualitativo = notaGuardada ? calcularCualitativo(Number(notaGuardada)) : null;

              return (
                <TableRow key={estudiante.id} className="hover:bg-cyan-50 transition-colors border-b border-gray-300">
                  <TableCell className="sticky left-0 z-10 bg-white hover:bg-cyan-50 transition-colors text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                    {index + 1}
                  </TableCell>
                  <TableCell className="sticky left-[60px] z-10 bg-white hover:bg-cyan-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] font-medium px-4 border-r-2 border-gray-400">
                    <span className="text-sm">{estudiante.nombres_completos}</span>
                  </TableCell>
                  <TableCell className="border-x border-gray-300 text-center px-2 py-2">
                    {calExistente ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold text-lg ${Number(notaGuardada) >= 7 ? 'text-green-700' :
                          Number(notaGuardada) >= 4 ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                          {Number(notaGuardada).toFixed(2)}
                        </span>
                        {cualitativo && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getColorCualitativo(cualitativo)}`}>
                            {cualitativo}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin calificación</span>
                    )}
                  </TableCell>
                  <TableCell className="border-x border-gray-300 text-center font-semibold bg-blue-50 px-3 py-2">
                    {ponderado}
                  </TableCell>
                  <TableCell className="border-l-2 border-gray-400 text-center px-2 py-2">
                    {calExistente ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModalDetalle({
                          open: true,
                          calificacion_id: calExistente.id,
                          estudiante_nombre: estudiante.nombres_completos,
                          trimestreEstado
                        })}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalle
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin calificación</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {modalDetalle && (
        <ModalDetalleProyecto
          calificacion_id={modalDetalle.calificacion_id}
          estudiante_nombre={modalDetalle.estudiante_nombre}
          isTutor={false}
          open={modalDetalle.open}
          onClose={() => setModalDetalle(null)}
          onSuccess={() => {
            refetch?.();
          }}
          trimestreEstado={modalDetalle.trimestreEstado}
        />
      )}

      {estadoFinalizado && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            El trimestre está finalizado. No se pueden realizar cambios.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}