'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, AlertTriangle, Users } from 'lucide-react';
import { materiaCursoService } from '@/lib/services/materia-curso';
import { periodosService, trimestresService } from '@/lib/services/periodos';
import { matriculasService } from '@/lib/services/matriculas';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import { TablaInsumos } from '@/lib/components/features/calificaciones/TablaInsumos';
import { TablaProyecto } from '@/lib/components/features/calificaciones/TablaProyecto';
import { TablaExamen } from '@/lib/components/features/calificaciones/TablaExamen';
import { TablaPromedioTrimestre } from '@/lib/components/features/calificaciones/TablaPromedioTrimestre';
import { SUPLETORIO_ID, TrimestreSelector } from '@/lib/components/features/calificaciones/TrimestreSelector';
import { TipoEvaluacionTabs, type TipoEvaluacion as TipoTab } from '@/lib/components/features/calificaciones/TipoEvaluacionTabs';
import { EscalaCalificaciones } from '@/lib/components/features/calificaciones/EscalaCalificaciones';
import { TablaRendimiento } from '@/lib/components/features/calificaciones/TablaRendimiento';
import { Button } from '@/lib/components/ui/button';
import { usePromedioTrimestre } from '@/lib/hooks/usePromedioTrimestre';
import { TipoEvaluacion, NombreTipoEvaluacion } from '@/lib/types/tipos-evaluacion.types';
import { PeriodoLectivo, TrimestreEstado } from '@/lib/types/periodo.types';
import { EstadoMatricula } from '@/lib/types/matricula.types';
import { Role } from '@/lib/types';
import { TablaSupletorios } from '@/lib/components/features/calificaciones/TablaSupletorios';

export default function CalificacionesPage() {
  const params = useParams();
  const router = useRouter();
  const materia_curso_id = params.materia_curso_id as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const usuario = localStorage.getItem('usuario');

      console.log('🔍 [AUTH CHECK] Token existe?', !!token);
      console.log('🔍 [AUTH CHECK] Usuario existe?', !!usuario);

      if (!token || !usuario) {
        console.error('❌ [AUTH CHECK] No hay token o usuario, redirigiendo al login');
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
    }
  }, [router]);

  const [materiaCurso, setMateriaCurso] = useState<any>(null);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState<string | null>(null);
  const [tipoActivo, setTipoActivo] = useState<TipoTab>('insumos');
  const [loading, setLoading] = useState(true);
  const [isTutor, setIsTutor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tiposEvaluacion, setTiposEvaluacion] = useState<TipoEvaluacion[]>([]);
  const [periodo, setPeriodo] = useState<PeriodoLectivo | null>(null);

  // ✅ Detectar si estamos viendo supletorios
  const viendoSupletorios = trimestreSeleccionado === SUPLETORIO_ID;

  // ✅ Hook de promedios SOLO cuando NO estamos en supletorios y hay trimestre válido
  const { promedios } = usePromedioTrimestre(
    materia_curso_id,
    (!viendoSupletorios && trimestreSeleccionado) ? trimestreSeleccionado : '' // Usar '' para deshabilitar
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    const cargarDatos = async () => {
      try {
        setLoading(true);
        console.log('🔵 [ADMIN] Iniciando carga de datos para materia_curso_id:', materia_curso_id);

        console.log('🔵 [ADMIN] 1. Obteniendo materia-curso...');
        const materiaCursoData = await materiaCursoService.findOne(materia_curso_id);
        console.log('✅ [ADMIN] MateriaCurso obtenida:', materiaCursoData);
        setMateriaCurso(materiaCursoData);

        const user = JSON.parse(localStorage.getItem('usuario') || '{}');
        console.log('🔵 [ADMIN] Usuario actual:', user);
        const esDocenteTutor = materiaCursoData.curso.docente_id === user.docente_id;
        const esAdmin = user.rol === Role.ADMIN;
        console.log('🔵 [ADMIN] Es tutor?', esDocenteTutor, 'Es admin?', esAdmin);
        setIsTutor(esDocenteTutor);
        setIsAdmin(esAdmin);

        console.log('🔵 [ADMIN] 2. Obteniendo período activo...');
        const periodoData = await periodosService.getPeriodoActivo();
        console.log('✅ [ADMIN] Período obtenido:', periodoData);
        setPeriodo(periodoData);

        console.log('🔵 [ADMIN] 3. Obteniendo trimestres del período:', materiaCursoData.curso.periodo_lectivo_id);
        const trimestresData = await trimestresService.getTrimestresByPeriodo(materiaCursoData.curso.periodo_lectivo_id);
        console.log('✅ [ADMIN] Trimestres obtenidos:', trimestresData);
        setTrimestres(trimestresData);

        const trimestreActivo = trimestresData.find((t: any) => t.estado === TrimestreEstado.ACTIVO);
        setTrimestreSeleccionado(trimestreActivo?.id || trimestresData[0]?.id || null);

        console.log('🔵 [ADMIN] 4. Obteniendo matrículas del curso:', materiaCursoData.curso_id);
        const matriculasData = await matriculasService.findByCurso(materiaCursoData.curso_id);
        console.log('✅ [ADMIN] Matrículas obtenidas:', matriculasData);
        const estudiantesActivos = matriculasData
          .filter((m: any) => m.estado === EstadoMatricula.ACTIVO)
          .map((m: any) => ({
            id: m.estudiante_id,
            nombres_completos: m.estudiante.nombres_completos,
            estado: m.estudiante.estado,
          }));
        console.log('✅ [ADMIN] Estudiantes activos:', estudiantesActivos);
        setEstudiantes(estudiantesActivos);

        console.log('🔵 [ADMIN] 5. Obteniendo tipos de evaluación del período:', materiaCursoData.curso.periodo_lectivo_id);
        const tipos = await tiposEvaluacionService.getByPeriodo(materiaCursoData.curso.periodo_lectivo_id);
        console.log('✅ [ADMIN] Tipos de evaluación obtenidos:', tipos);
        setTiposEvaluacion(tipos);

        console.log('✅ [ADMIN] Carga de datos completada exitosamente');
      } catch (error: any) {
        console.error('❌ [ADMIN] ERROR en carga de datos:', error);
        console.error('❌ [ADMIN] Error response:', error.response);
        console.error('❌ [ADMIN] Error status:', error.response?.status);
        console.error('❌ [ADMIN] Error data:', error.response?.data);
        toast.error(error.response?.data?.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [materia_curso_id, isAuthenticated]);

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
    if (viendoSupletorios) {
      return (
        <TablaSupletorios
          materia_curso_id={materia_curso_id}
          periodo_lectivo_id={materiaCurso.curso.periodo_lectivo_id}
          estadoSupletorio={periodo?.estado_supletorio!}
          materia_nombre={materiaCurso.materia.nombre}
          periodo_nombre={periodo?.nombre || ''}
        />
      );
    }

    // ✅ Guard: No renderizar nada si no hay trimestre válido (no UUID)
    if (!trimestreSeleccionado || trimestreSeleccionado === SUPLETORIO_ID) {
      return null;
    }

    const trimestreActual = trimestres.find(t => t.id === trimestreSeleccionado);
    const estadoTrimestre = trimestreActual?.estado || TrimestreEstado.PENDIENTE;

    switch (tipoActivo) {
      case 'insumos':
        return (
          <TablaInsumos
            materia_curso_id={materia_curso_id}
            trimestre_id={trimestreSeleccionado}
            estudiantes={estudiantes}
            porcentaje={porcentajes.insumos}
            trimestreEstado={estadoTrimestre}
            materia_nombre={materiaCurso.materia.nombre} // 🆕
            trimestre_nombre={trimestreActual?.nombre || ''}
          />
        );
      case 'proyecto':
        return (
          <TablaProyecto
            curso_id={materiaCurso.curso_id}
            trimestre_id={trimestreSeleccionado}
            estudiantes={estudiantes}
            isTutor={isTutor}
            porcentaje={porcentajes.proyecto}
            trimestreEstado={estadoTrimestre}
          />
        );
      case 'examen':
        return (
          <TablaExamen
            materia_curso_id={materia_curso_id}
            trimestre_id={trimestreSeleccionado}
            estudiantes={estudiantes}
            porcentaje={porcentajes.examen}
            trimestreEstado={estadoTrimestre}
          />
        );
      case 'promedios':
        return (
          <TablaPromedioTrimestre
            materia_curso_id={materia_curso_id}
            trimestre_id={trimestreSeleccionado}
            estudiantes={estudiantes}
            trimestreEstado={estadoTrimestre}
            porcentajes={porcentajes}
            isAdmin={isAdmin}
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!materiaCurso) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <p className="text-lg text-gray-600">No se encontró la materia-curso</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  const trimestreActual = trimestres.find(t => t.id === trimestreSeleccionado);

  return (
    <div className="container mx-auto py-6 px-4 max-w-[1800px]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Calificaciones: {materiaCurso.materia.nombre} ~ {materiaCurso.curso.nivel} &quot;{materiaCurso.curso.paralelo}&quot;
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Docente: {materiaCurso.docente.nombres} {materiaCurso.docente.apellidos}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Users className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {estudiantes.length} {estudiantes.length === 1 ? 'estudiante' : 'estudiantes'}
          </span>
        </div>
      </div>

      {/* Selector de Trimestre */}
      <div className="mb-6">
        <TrimestreSelector
          trimestres={trimestres}
          trimestreSeleccionado={trimestreSeleccionado}
          onSeleccionar={setTrimestreSeleccionado}
          estadoSupletorio={periodo?.estado_supletorio}
        />
      </div>

      {/* Layout con sidebar derecho - SOLO cuando NO viendo supletorios */}
      {!viendoSupletorios && trimestreSeleccionado ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Contenido principal izquierdo */}
          <div className="space-y-4">
            {/* Tabs de Tipo de Evaluación */}
            <TipoEvaluacionTabs
              tipoActivo={tipoActivo}
              onCambiar={setTipoActivo}
              porcentajes={porcentajes}
            />

            {/* Contenido de las tablas */}
            {trimestreSeleccionado && renderContenido()}
          </div>

          {/* Sidebar derecho */}
          <div className="space-y-4">
            {/* Escala de Calificaciones */}
            <EscalaCalificaciones />

            {/* Rendimiento del Trimestre */}
            {trimestreSeleccionado && promedios.length > 0 && (
              <TablaRendimiento
                promedios={promedios}
                nombreTrimestre={trimestreActual?.nombre || ''}
              />
            )}
          </div>
        </div>
      ) : (
        /* Vista de supletorios - sin sidebar */
        <div className="space-y-4">
          {trimestreSeleccionado && renderContenido()}
        </div>
      )}

      {/* Mensaje si no hay trimestre seleccionado */}
      {!trimestreSeleccionado && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
          <p className="text-lg text-gray-600">No hay trimestres disponibles</p>
        </div>
      )}
    </div>
  );
}