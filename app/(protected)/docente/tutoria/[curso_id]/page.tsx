'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, AlertTriangle, Users } from 'lucide-react';
import { cursosService } from '@/lib/services/cursos';
import { matriculasService } from '@/lib/services/matriculas';
import { trimestresService } from '@/lib/services/periodos';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import { Button } from '@/lib/components/ui/button';
import { TrimestreSelector } from '@/lib/components/features/calificaciones/TrimestreSelector';
import { TutoriaTabs, type TipoTutoriaTab } from '@/lib/components/features/calificaciones/tutoria/TutoriaTabs';
import { TablaProyectoTutoria } from '@/lib/components/features/calificaciones/tutoria/TablaProyectoTutoria';
import { TablaComponentesTutoria } from '@/lib/components/features/calificaciones/tutoria/TablaComponentesTutoria';
import { TablaReportes } from '@/lib/components/features/calificaciones/TablaReportes';
import { usePromedioTrimestre } from '@/lib/hooks/usePromedioTrimestre';
import { EstadoMatricula } from '@/lib/types/matricula.types';
import { TrimestreEstado } from '@/lib/types/periodo.types';
import { NombreTipoEvaluacion } from '@/lib/types/tipos-evaluacion.types';

export default function TutoriaDashboard() {
  const params = useParams();
  const router = useRouter();
  const curso_id = params.curso_id as string;

  const [curso, setCurso] = useState<any>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [trimestreSeleccionado, setTrimestreSeleccionado] = useState<string | null>(null);
  const [tipoActivo, setTipoActivo] = useState<TipoTutoriaTab>('proyecto');
  const [loading, setLoading] = useState(true);
  const [porcentajeProyecto, setPorcentajeProyecto] = useState(0);

  // Hook para promedios (necesario para reportes)
  const { promedios, isLoading: loadingPromedios } = usePromedioTrimestre(
    curso_id, // No aplica materia_curso_id en tutoría
    trimestreSeleccionado || ''
  );

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const cursoData = await cursosService.findOne(curso_id);
        setCurso(cursoData);

        const matriculasData = await matriculasService.findByCurso(curso_id);
        const estudiantesActivos = matriculasData
          .filter((m: any) => m.estado === EstadoMatricula.ACTIVO)
          .map((m: any) => ({
            id: m.estudiante_id,
            matricula_id: m.id,
            nombres_completos: m.estudiante.nombres_completos,
            estudiante_cedula: m.estudiante.estudiante_cedula,
            estudiante: m.estudiante
          }));
        setEstudiantes(estudiantesActivos);

        const trimestresData = await trimestresService.getTrimestresByPeriodo(cursoData.periodo_lectivo_id);
        setTrimestres(trimestresData);

        const trimestreActivo = trimestresData.find((t: any) => t.estado === TrimestreEstado.ACTIVO);
        setTrimestreSeleccionado(trimestreActivo?.id || trimestresData[0]?.id || null);

        // Obtener porcentaje de proyecto
        const tipos = await tiposEvaluacionService.getByPeriodo(cursoData.periodo_lectivo_id);
        const tipoProyecto = tipos.find(t => t.nombre === NombreTipoEvaluacion.PROYECTO);
        setPorcentajeProyecto(tipoProyecto?.porcentaje || 0);

      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error al cargar datos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [curso_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando información de tutoría...</p>
        </div>
      </div>
    );
  }

  if (!curso || !trimestreSeleccionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white border-l-4 border-yellow-600 rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Error al cargar datos</h3>
                <p className="text-gray-600">No se pudo cargar la información del curso.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatNivel = (nivel: string) => {
    if (nivel.includes('BACHILLERATO')) {
      return nivel.split(' ').map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
    }
    return nivel.charAt(0) + nivel.slice(1).toLowerCase();
  };

  const trimestreActual = trimestres.find(t => t.id === trimestreSeleccionado);
  const estadoTrimestre = trimestreActual?.estado || TrimestreEstado.PENDIENTE;

  const renderContenido = () => {
    switch (tipoActivo) {
      case 'proyecto':
        return (
          <TablaProyectoTutoria
            curso_id={curso_id}
            trimestre_id={trimestreSeleccionado!}
            estudiantes={estudiantes}
            porcentaje={porcentajeProyecto}
            trimestreEstado={estadoTrimestre}
          />
        );
      case 'componentes':
        return (
          <TablaComponentesTutoria
            curso_id={curso_id}
            trimestre_id={trimestreSeleccionado!}
            estudiantes={estudiantes}
            trimestreEstado={estadoTrimestre}
          />
        );
      case 'reportes':
        return (
          <TablaReportes
            estudiantes={estudiantes}
            promedios={promedios}
            trimestre_id={trimestreSeleccionado!}
            trimestre_nombre={trimestreActual?.nombre || ''}
            curso_id={curso_id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-500 shadow-lg">
        <div className="max-w-[98%] mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/docente')}
              variant="ghost"
              size="icon"
              className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 text-white hover:scale-105 border-0 cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
                Mi Tutoría: {formatNivel(curso.nivel)} - Paralelo "{curso.paralelo}"
              </h1>
              <p className="text-yellow-100 mt-1">
                {curso.periodo_lectivo.nombre} • {curso.especialidad}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[98%] mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Selector de Trimestre */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-yellow-300 p-6">
            <TrimestreSelector
              trimestres={trimestres}
              trimestreSeleccionado={trimestreSeleccionado}
              onSeleccionar={setTrimestreSeleccionado}
            />
          </div>

          {/* Tabs de Tutoría */}
          <div className="bg-white rounded-2xl shadow-md border-2 border-gray-300 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 p-4">
              <TutoriaTabs
                tipoActivo={tipoActivo}
                onCambiar={setTipoActivo}
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
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-2">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {estudiantes.length} estudiantes activos
                  </p>
                  <p className="text-xs text-gray-500">En tu curso de tutoría</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}