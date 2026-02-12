'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Save } from 'lucide-react';
import { ModalEditarDatosPersonales } from './ModalEditarDatosPersonales';
import { Button } from '@/lib/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { toast } from 'sonner';
import { Role, TrimestreEstado } from '@/lib/types';
import { useComponentesCualitativos, useCalificacionCualitativa } from '@/lib/hooks/useCalificacionCualitativa';
import { CalificacionComponente, CalificarMasivoDto } from '@/lib/types/calificaciones.types';
import { NivelCurso } from '@/lib/types/curso.types';
import { NivelEducativo } from '@/lib/types/materia.types';

interface TablaComponentesTutoriaProps {
  curso_id: string;
  trimestre_id: string;
  nivel: NivelCurso;
  estudiantes: Array<{
    id: string;
    nombres_completos: string;
    estudiante: any;
  }>;
  trimestreEstado?: TrimestreEstado;
}

const getNivelEducativo = (nivel: NivelCurso): NivelEducativo => {
  const nivelesBasicos = [NivelCurso.OCTAVO, NivelCurso.NOVENO, NivelCurso.DECIMO];
  return nivelesBasicos.includes(nivel) ? NivelEducativo.BASICA : NivelEducativo.BACHILLERATO;
};

const SIN_CALIFICAR = '__SIN_CALIFICAR__';

export function TablaComponentesTutoria({
  curso_id,
  trimestre_id,
  nivel,
  estudiantes,
  trimestreEstado
}: TablaComponentesTutoriaProps) {
  const estadoFinalizado = trimestreEstado === TrimestreEstado.FINALIZADO;
  const nivelEducativo = getNivelEducativo(nivel);

  const { componentes, isLoading: loadingComponentes } = useComponentesCualitativos(nivelEducativo);
  const {
    calificaciones,
    isLoading: loadingCalificaciones,
    guardarCalificaciones,
    isSaving
  } = useCalificacionCualitativa(curso_id, trimestre_id);

  const [notasOriginales, setNotasOriginales] = useState<Record<string, Record<string, CalificacionComponente | null>>>({});
  const [notasTemp, setNotasTemp] = useState<Record<string, Record<string, CalificacionComponente | null>>>({});
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<string>>(new Set());
  const [modalEdicion, setModalEdicion] = useState<{
    open: boolean;
    estudiante: any;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  useEffect(() => {
    if (calificaciones.length > 0) {
      const notasIniciales: Record<string, Record<string, CalificacionComponente | null>> = {};

      calificaciones.forEach((cal) => {
        if (!notasIniciales[cal.estudiante_id]) {
          notasIniciales[cal.estudiante_id] = {};
        }
        notasIniciales[cal.estudiante_id][cal.materia_id] = cal.calificacion;
      });

      setNotasOriginales(notasIniciales);
      setNotasTemp(notasIniciales);
      setCambiosPendientes(new Set());
    }
  }, [calificaciones]);

  const handleNotaChange = (estudianteId: string, materiaId: string, value: string) => {
    const nuevaCalificacion = value === SIN_CALIFICAR ? null : (value as CalificacionComponente);
    const calificacionOriginal = notasOriginales[estudianteId]?.[materiaId] ?? null;

    setNotasTemp((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [materiaId]: nuevaCalificacion,
      },
    }));

    const key = `${estudianteId}:${materiaId}`;
    setCambiosPendientes((prev) => {
      const newSet = new Set(prev);

      if (nuevaCalificacion !== calificacionOriginal) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }

      return newSet;
    });
  };

  const handleGuardar = async () => {
    if (cambiosPendientes.size === 0) {
      toast.info('No hay cambios para guardar');
      return;
    }

    const calificacionesArray: CalificarMasivoDto['calificaciones'] = [];

    cambiosPendientes.forEach((key) => {
      const [estudianteId, materiaId] = key.split(':');
      const calificacion = notasTemp[estudianteId]?.[materiaId] ?? null;

      calificacionesArray.push({
        estudiante_id: estudianteId,
        materia_id: materiaId,
        calificacion,
      });
    });

    const dto: CalificarMasivoDto = {
      curso_id,
      trimestre_id,
      calificaciones: calificacionesArray,
    };

    await guardarCalificaciones(dto);

    setNotasOriginales(notasTemp);
    setCambiosPendientes(new Set());
  };

  if (loadingComponentes || loadingCalificaciones) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-gray-600">Cargando componentes...</span>
      </div>
    );
  }

  if (componentes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No hay componentes cualitativos configurados para este nivel</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-full p-2">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Componentes Cualitativos</h3>
              <p className="text-sm text-gray-600">
                {componentes.length} componente(s) para {nivelEducativo}
                {cambiosPendientes.size > 0 && (
                  <span className="ml-2 text-orange-600 font-semibold">
                    • {cambiosPendientes.size} cambio(s) pendiente(s)
                  </span>
                )}
              </p>
            </div>
          </div>
          {!estadoFinalizado && (
            <Button
              onClick={handleGuardar}
              disabled={isSaving || cambiosPendientes.size === 0 || isAdmin}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar {cambiosPendientes.size > 0 ? `(${cambiosPendientes.size})` : 'Cambios'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-400">
              <TableHead className="text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                #
              </TableHead>
              <TableHead className="w-[300px] min-w-[300px] max-w-[300px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                Estudiante
              </TableHead>
              {componentes.map((componente) => (
                <TableHead
                  key={componente.id}
                  className="border-x border-gray-300 text-center w-[180px] min-w-[180px] font-semibold text-gray-900"
                >
                  <div className="font-bold text-purple-700">{componente.nombre}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {estudiantes.map((estudiante, index) => (
              <TableRow key={estudiante.id} className="border-b border-gray-300 hover:bg-purple-50">
                <TableCell className="text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                  {index + 1}
                </TableCell>

                <TableCell className="font-medium px-4 border-r-2 border-gray-400">
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:text-purple-600 transition-colors group"
                    onClick={() =>
                      setModalEdicion({ open: true, estudiante: estudiante.estudiante })
                    }
                    title="Click para editar datos personales"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center font-bold text-white text-sm group-hover:scale-110 transition-transform">
                      {estudiante.nombres_completos.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm group-hover:underline">
                      {estudiante.nombres_completos}
                    </span>
                  </div>
                </TableCell>

                {componentes.map((componente) => {
                  const key = `${estudiante.id}:${componente.id}`;
                  const tieneCambio = cambiosPendientes.has(key);

                  return (
                    <TableCell
                      key={componente.id}
                      className={`border-x border-gray-300 text-center px-2 py-2 transition-colors ${tieneCambio ? 'bg-yellow-50' : ''
                        }`}
                    >
                      {estadoFinalizado ? (
                        <span className="font-bold text-gray-900">
                          {notasTemp[estudiante.id]?.[componente.id] || '-'}
                        </span>
                      ) : (
                        <Select
                          disabled={isAdmin}
                          value={(notasTemp[estudiante.id]?.[componente.id] as string) || SIN_CALIFICAR}
                          onValueChange={(value) =>
                            handleNotaChange(estudiante.id, componente.id, value)
                          }
                        >
                          <SelectTrigger className={`w-full max-w-[140px] mx-auto border-2 focus:border-purple-500 ${tieneCambio ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
                            }`}>
                            <SelectValue placeholder="Sin calificar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SIN_CALIFICAR}>Sin calificar</SelectItem>
                            <SelectItem value={CalificacionComponente.MAS_A}>+A</SelectItem>
                            <SelectItem value={CalificacionComponente.A}>A</SelectItem>
                            <SelectItem value={CalificacionComponente.A_MENOS}>A-</SelectItem>
                            <SelectItem value={CalificacionComponente.B_MAS}>B+</SelectItem>
                            <SelectItem value={CalificacionComponente.B}>B</SelectItem>
                            <SelectItem value={CalificacionComponente.B_MENOS}>B-</SelectItem>
                            <SelectItem value={CalificacionComponente.C_MAS}>C+</SelectItem>
                            <SelectItem value={CalificacionComponente.C}>C</SelectItem>
                            <SelectItem value={CalificacionComponente.C_MENOS}>C-</SelectItem>
                            <SelectItem value={CalificacionComponente.D}>D</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {modalEdicion && (
        <ModalEditarDatosPersonales
          estudiante={modalEdicion.estudiante}
          onClose={() => setModalEdicion(null)}
        />
      )}
    </div>
  );
}