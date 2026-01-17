'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, AlertTriangle, Users } from 'lucide-react';
import { materiaCursoService } from '@/lib/services/materia-curso';
import { trimestresService } from '@/lib/services/periodos';
import { matriculasService } from '@/lib/services/matriculas';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import { TablaInsumos } from '@/lib/components/features/calificaciones/TablaInsumos';
import { TablaProyecto } from '@/lib/components/features/calificaciones/TablaProyecto';
import { TablaExamen } from '@/lib/components/features/calificaciones/TablaExamen';
import { TablaPromedioTrimestre } from '@/lib/components/features/calificaciones/TablaPromedioTrimestre';
import { TrimestreSelector } from '@/lib/components/features/calificaciones/TrimestreSelector';
import { TipoEvaluacionTabs, type TipoEvaluacion as TipoTab } from '@/lib/components/features/calificaciones/TipoEvaluacionTabs';
import { EscalaCalificaciones } from '@/lib/components/features/calificaciones/EscalaCalificaciones';
import { TablaRendimiento } from '@/lib/components/features/calificaciones/TablaRendimiento';
import { Button } from '@/lib/components/ui/button';
import { usePromedioTrimestre } from '@/lib/hooks/usePromedioTrimestre';
import { TipoEvaluacion, NombreTipoEvaluacion } from '@/lib/types/tipos-evaluacion.types';
import { TrimestreEstado } from '@/lib/types/periodo.types';
import { EstadoMatricula } from '@/lib/types/matricula.types';
import { es } from 'date-fns/locale';

export default function CalificacionesPage() {
  const params = useParams();
  const router = useRouter();
  const materia_curso_id = params.materia_curso_id as string;

  const [materiaCurso, setMateriaCurso] = useState<any>(null);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState<string | null>(null);
  const [tipoActivo, setTipoActivo] = useState<TipoTab>('insumos');
  const [loading, setLoading] = useState(true);
  const [isTutor, setIsTutor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiposEvaluacion, setTiposEvaluacion] = useState<TipoEvaluacion[]>([]);

  // Hook de promedios para la tabla de rendimiento
  const { promedios } = usePromedioTrimestre(
    materia_curso_id,
    trimestreSeleccionado || ''
  );

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const materiaCursoData = await materiaCursoService.findOne(materia_curso_id);
        setMateriaCurso(materiaCursoData);

        const user = JSON.parse(localStorage.getItem('usuario') || '{}');
        const esDocenteTutor = materiaCursoData.curso.docente_id === user.docente_id;
        const esAdmin = user.rol === 'ADMIN';
        setIsTutor(esDocenteTutor);
        setIsAdmin(esAdmin);

        const trimestresData = await trimestresService.getTrimestresByPeriodo(materiaCursoData.curso.periodo_lectivo_id);
        setTrimestres(trimestresData);

        const trimestreActivo = trimestresData.find((t: any) => t.estado === TrimestreEstado.ACTIVO);
        setTrimestreSeleccionado(trimestreActivo?.id || trimestresData[0]?.id || null);

        const matriculasData = await matriculasService.findByCurso(materiaCursoData.curso_id);
        const estudiantesActivos = matriculasData
          .filter((m: any) => m.estado === EstadoMatricula.ACTIVO)
          .map((m: any) => ({
            id: m.estudiante_id,
            nombres_completos: m.estudiante.nombres_completos,
            estado: m.estudiante.estado,
          }));
        setEstudiantes(estudiantesActivos);

        const tipos = await tiposEvaluacionService.getByPeriodo(materiaCursoData.curso.periodo_lectivo_id);
        setTiposEvaluacion(tipos);

      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al cargar datos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [materia_curso_id]);

  const obtenerPorcentaje = (tipo: NombreTipoEvaluacion): number => {
    const tipoEval = tiposEvaluacion.find(t => t.nombre === tipo);
    return tipoEval?.porcentaje || 0;
  };

  const porcentajes = {
    insumos: obtenerPorcentaje(NombreTipoEvaluacion.INSUMOS),
    proyecto: obtenerPorcentaje(NombreTipoEvaluacion.PROYECTO),
    examen: obtenerPorcentaje(NombreTipoEvaluacion.EXAMEN),
  };

  const renderContenido = () => {
    // ✅ Obtener el trimestre actual seleccionado para pasar su estado
    const trimestreActual = trimestres.find(t => t.id === trimestreSeleccionado);
    const estadoTrimestre = trimestreActual?.estado || TrimestreEstado.PENDIENTE;

    switch (tipoActivo) {
      case 'insumos':
        return (
          <TablaInsumos
            materia_curso_id={materia_curso_id}
            trimestre_id={trimestreSeleccionado!}
            estudiantes={estudiantes}
            porcentaje={porcentajes.insumos}
            trimestreEstado={estadoTrimestre} // ✅ Agregar
          />
        );
      case 'proyecto':
        return (
          <TablaProyecto
            curso_id={materiaCurso.curso_id}
            trimestre_id={trimestreSeleccionado!}
            estudiantes={estudiantes}
            isTutor={isTutor}
            porcentaje={porcentajes.proyecto}
            trimestreEstado={estadoTrimestre} // ✅ Agregar
          />
        );
      case 'examen':
        return (
          <TablaExamen
            materia_curso_id={materia_curso_id}
            trimestre_id={trimestreSeleccionado!}
            estudiantes={estudiantes}
            porcentaje={porcentajes.examen}
            trimestreEstado={estadoTrimestre} // ✅ Agregar
          />
        );
      case 'promedio':
        return (
          <TablaPromedioTrimestre
            materia_curso_id={materia_curso_id}
            trimestre_id={trimestreSeleccionado!}
            estudiantes={estudiantes}
            porcentajes={porcentajes}
            isAdmin={isAdmin}
            trimestreEstado={estadoTrimestre}
            materia_nombre={materiaCurso.materia.nombre}
            trimestre_nombre={trimestreActual?.nombre || ''}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  if (!materiaCurso || !trimestreSeleccionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Error al cargar datos</h3>
                <p className="text-gray-600">No se pudo cargar la información de la materia o trimestres.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const trimestreActual = trimestres.find(t => t.id === trimestreSeleccionado);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header con gradiente institucional */}
      <header className="bg-gradient-to-r from-red-600 via-red-700 to-yellow-600 shadow-lg">
        <div className="max-w-[98%] mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 text-white hover:scale-105 border-0 cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                Calificaciones: {materiaCurso.materia.nombre} ~ {materiaCurso.curso.nivel} "{materiaCurso.curso.paralelo}"
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[98%] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenido principal - 3 columnas */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selector de Trimestre */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-300 p-6">
              <TrimestreSelector
                trimestres={trimestres}
                trimestreSeleccionado={trimestreSeleccionado}
                onSeleccionar={setTrimestreSeleccionado}
              />
            </div>

            {/* Tabs de evaluación */}
            <div className="bg-white rounded-2xl shadow-md border-2 border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 p-4">
                <TipoEvaluacionTabs
                  tipoActivo={tipoActivo}
                  onCambiar={setTipoActivo}
                  porcentajes={porcentajes}
                />
              </div>

              <div className="p-6">
                {renderContenido()}
              </div>
            </div>

            {/* Footer info */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-red-100 to-yellow-100 rounded-lg p-2">
                    <Users className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {estudiantes.length} estudiantes activos
                    </p>
                    <p className="text-xs text-gray-500">En este curso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar derecho - 1 columna */}
          <div className="lg:col-span-1 space-y-6">
            {/* Escala de Calificaciones */}
            <EscalaCalificaciones />

            {/* Tabla de Rendimiento - Solo si hay promedios */}
            {promedios.length > 0 && trimestreActual && (
              <TablaRendimiento
                promedios={promedios}
                nombreTrimestre={trimestreActual.nombre}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}