'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Save, BookOpen, User, Zap } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Badge } from '@/lib/components/ui/badge';
import { toast } from 'sonner';
import { useCalificacionCualitativa, useComponentesCualitativos } from '@/lib/hooks/useCalificacionCualitativa';
import { useCalificacionRapida } from '@/lib/hooks/useCalificacionRapida';
import { CalificacionComponente, CalificarMasivoDto } from '@/lib/types/calificaciones.types';
import { NivelCurso, TrimestreEstado } from '@/lib/types';
import { NivelEducativo } from '@/lib/types/materia.types';
import { Role } from '@/lib/types/usuario.types';
import { ModalEditarDatosPersonales } from '../tutoria/ModalEditarDatosPersonales';
import { PanelCalificacionRapida } from './PanelCalificacionRapida';
import { TablaCalificacionManual } from './TablaCalificacionManual';

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

type ModoCalificacion = 'manual' | 'rapido';

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

  // Estados compartidos
  const [notasOriginales, setNotasOriginales] = useState<Record<string, Record<string, CalificacionComponente | null>>>({});
  const [notasTemp, setNotasTemp] = useState<Record<string, Record<string, CalificacionComponente | null>>>({});
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<string>>(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [modalEdicion, setModalEdicion] = useState<{
    open: boolean;
    estudiante: any;
  } | null>(null);

  // Estado para modo de calificación
  const [modoCalificacion, setModoCalificacion] = useState<ModoCalificacion>('manual');

  // Hook personalizado para modo rápido
  const {
    componenteSeleccionado,
    calificacionSeleccionada,
    estudiantesSeleccionados,
    setComponenteSeleccionado,
    setCalificacionSeleccionada,
    toggleEstudiante,
    toggleTodos,
    aplicarCalificacion,
    resetSelecciones,
  } = useCalificacionRapida({
    notasOriginales,
    setNotasTemp,
    setCambiosPendientes,
  });

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  // Optimización: Memoizar el procesamiento de calificaciones iniciales
  const notasInicialesCalculadas = useMemo(() => {
    if (calificaciones.length === 0) {
      return {};
    }

    const notasIniciales: Record<string, Record<string, CalificacionComponente | null>> = {};

    calificaciones.forEach((cal) => {
      if (!notasIniciales[cal.estudiante_id]) {
        notasIniciales[cal.estudiante_id] = {};
      }
      notasIniciales[cal.estudiante_id][cal.materia_id] = cal.calificacion;
    });

    return notasIniciales;
  }, [calificaciones]);

  // Simplificado: useEffect solo actualiza estado
  useEffect(() => {
    setNotasOriginales(notasInicialesCalculadas);
    setNotasTemp(notasInicialesCalculadas);
    setCambiosPendientes(new Set());
  }, [notasInicialesCalculadas]);

  // Resetear selecciones al cambiar modo
  useEffect(() => {
    if (modoCalificacion === 'rapido') {
      resetSelecciones();
    }
  }, [modoCalificacion, resetSelecciones]);

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
      {/* Header con toggle de modo */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-full p-2">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Componentes Cualitativos</h3>
              <p className="text-sm text-gray-600">
                {cambiosPendientes.size > 0 && (
                  <>
                    <Badge variant="destructive" className="ml-2">{cambiosPendientes.size} cambio(s) pendiente(s)</Badge>
                    <span className="text-xs text-orange-600 ml-2">
                      → Presiona "Guardar" para aplicar cambios
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Modo de Calificación */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border-2 border-purple-300">
              <Button
                variant={modoCalificacion === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModoCalificacion('manual')}
                className={modoCalificacion === 'manual' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'hover:bg-purple-50'}
              >
                <User className="w-4 h-4 mr-2" />
                Manual
              </Button>
              <Button
                variant={modoCalificacion === 'rapido' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModoCalificacion('rapido')}
                className={modoCalificacion === 'rapido' 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white' 
                  : 'hover:bg-pink-50'}
              >
                <Zap className="w-4 h-4 mr-2" />
                Rápido
              </Button>
            </div>

            {!estadoFinalizado && (
              <Button
                onClick={handleGuardar}
                disabled={isSaving || cambiosPendientes.size === 0 || isAdmin}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando ({cambiosPendientes.size})
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar ({cambiosPendientes.size})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mensaje de carga */}
      {isSaving && (
        <Alert className="border-2 border-purple-400 bg-purple-50 animate-pulse">
          <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
          <AlertDescription>
            <p className="font-semibold text-purple-900 mb-1">
              Guardando calificaciones cualitativas...
            </p>
            <p className="text-sm text-purple-700">
              Actualizando {cambiosPendientes.size} calificación(es). Por favor espera...
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Renderizado condicional de modos */}
      {modoCalificacion === 'rapido' && (
        <PanelCalificacionRapida
          componentes={componentes}
          estudiantes={estudiantes}
          componenteSeleccionado={componenteSeleccionado}
          calificacionSeleccionada={calificacionSeleccionada}
          estudiantesSeleccionados={estudiantesSeleccionados}
          notasTemp={notasTemp}
          estadoFinalizado={estadoFinalizado}
          isAdmin={isAdmin}
          onComponenteChange={setComponenteSeleccionado}
          onCalificacionChange={setCalificacionSeleccionada}
          onEstudianteToggle={toggleEstudiante}
          onToggleTodos={() => toggleTodos(estudiantes)}
          onAplicarCalificacion={aplicarCalificacion}
        />
      )}

      {modoCalificacion === 'manual' && (
        <TablaCalificacionManual
          componentes={componentes}
          estudiantes={estudiantes}
          notasTemp={notasTemp}
          estadoFinalizado={estadoFinalizado}
          isAdmin={isAdmin}
          isSaving={isSaving}
          onNotaChange={handleNotaChange}
          onEstudianteClick={(estudiante) => setModalEdicion({ open: true, estudiante })}
        />
      )}

      {/* Modal de edición de datos personales */}
      {modalEdicion && (
        <ModalEditarDatosPersonales
          estudiante={modalEdicion.estudiante}
          onClose={() => setModalEdicion(null)}
        />
      )}
    </div>
  );
}