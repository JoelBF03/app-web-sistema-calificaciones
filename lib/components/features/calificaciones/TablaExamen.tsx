'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Eye, AlertCircle } from 'lucide-react';
import { useCalificacionExamen } from '@/lib/hooks/useCalificacionExamen';
import { ModalDetalleExamen } from './ModalDetalleExamen';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { toast } from 'sonner';
import { calcularCualitativo, getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { EstadoEstudiante, Role, TrimestreEstado } from '@/lib/types';
import { Alert, AlertDescription } from '../../ui/alert';
import { calificacionExamenService } from '@/lib/services/calificacion-examen';
import { useQueryClient } from '@tanstack/react-query';

interface TablaExamenProps {
  materia_curso_id: string;
  trimestre_id: string;
  estudiantes: Array<{ id: string; nombres_completos: string, estado?: string }>;
  porcentaje: number;
  trimestreEstado?: TrimestreEstado;
}

export function TablaExamen({ materia_curso_id, trimestre_id, estudiantes, porcentaje, trimestreEstado }: TablaExamenProps) {
  const {
    calificaciones,
    isLoading,
    guardarCalificaciones,
    isSaving
  } = useCalificacionExamen(materia_curso_id, trimestre_id);

  const [notasTemp, setNotasTemp] = useState<Record<string, string>>({});
  const estadoFinalizado = trimestreEstado === TrimestreEstado.FINALIZADO;
  const trimestreActivo = trimestreEstado === TrimestreEstado.ACTIVO;
  const [modalDetalle, setModalDetalle] = useState<{
    open: boolean;
    calificacion_id: string;
    estudiante_nombre: string;
    trimestreEstado?: TrimestreEstado;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  const handleGuardar = async () => {
    const calificacionesArray = estudiantes
      .filter(est => {
        const notaStr = notasTemp[est.id];
        if (!notaStr || notaStr.trim() === '') return false;
        const nota = parseFloat(notaStr);
        return !isNaN(nota) && nota >= 0 && nota <= 10;
      })
      .map(est => ({
        estudiante_id: est.id,
        calificacion_examen: parseFloat(notasTemp[est.id]),
      }));

    if (calificacionesArray.length === 0) {
      toast.error('Debes ingresar al menos una calificación válida');
      return;
    }

    guardarCalificaciones({
      materia_curso_id,
      trimestre_id,
      calificaciones: calificacionesArray
    });

    setNotasTemp({});
  };

  const handleNotaChange = (estudianteId: string, value: string) => {
    if (value === '') {
      setNotasTemp(prev => ({ ...prev, [estudianteId]: '' }));
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

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

  return (
    <div className="space-y-4">
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
                Nota Examen
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
              const notaGuardada = calExistente?.calificacion_examen;

              const notaActual = notasTemp[estudiante.id] || '';
              const notaNum = parseFloat(notaActual);
              const esValida = !isNaN(notaNum);
              const ponderadoTemp = esValida ? calcularPonderado(notaNum) : '';
              const ponderadoGuardado = notaGuardada ? calcularPonderado(Number(notaGuardada)) : '';

              const cualitativoTemp = esValida ? calcularCualitativo(notaNum) : null;
              const cualitativoGuardado = notaGuardada ? calcularCualitativo(Number(notaGuardada)) : null;

              return (
                <TableRow key={estudiante.id} className={`hover:bg-cyan-50 transition-colors border-b border-gray-300 ${esInactivo ? 'bg-gray-100 opacity-60' : ''}`}>
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
                        {cualitativoGuardado && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getColorCualitativo(cualitativoGuardado)}`}>
                            {cualitativoGuardado}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Input
                          type="text"
                          disabled={!!calExistente || estadoFinalizado || !trimestreActivo || isAdmin}
                          inputMode="decimal"
                          value={notaActual}
                          onChange={(e) => handleNotaChange(estudiante.id, e.target.value)}
                          className={`w-full text-center border-2 ${esValida
                            ? notaNum >= 7
                              ? 'border-green-600 bg-green-50 text-green-700 font-bold focus-visible:ring-green-500'
                              : notaNum >= 4
                                ? 'border-yellow-600 bg-yellow-50 text-yellow-700 font-bold focus-visible:ring-yellow-500'
                                : 'border-red-600 bg-red-50 text-red-700 font-bold focus-visible:ring-red-500'
                            : 'border-gray-500'
                            }`}
                        />
                        {cualitativoTemp && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getColorCualitativo(cualitativoTemp)}`}>
                            {cualitativoTemp}
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="border-x border-gray-300 text-center font-semibold bg-blue-50 px-3 py-2">
                    {calExistente ? ponderadoGuardado : (ponderadoTemp || '-')}
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

      <div className="flex justify-end">
        <Button
          onClick={handleGuardar}
          disabled={isSaving || estadoFinalizado || !trimestreActivo || isAdmin}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 cursor-pointer"
        >
          {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar Calificaciones
        </Button>
      </div>

      {modalDetalle && (
        <ModalDetalleExamen
          calificacion_id={modalDetalle.calificacion_id}
          estudiante_nombre={modalDetalle.estudiante_nombre}
          open={modalDetalle.open}
          materia_curso_id={materia_curso_id}
          trimestre_id={trimestre_id}
          onClose={() => setModalDetalle(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ['calificaciones-examen', materia_curso_id, trimestre_id]
            });
            setModalDetalle(null);
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