'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { useCursos } from '@/lib/hooks/useCursos';
import { useMaterias } from '@/lib/hooks/useMaterias';
import { useDocentes } from '@/lib/hooks/useDocentes';
import { useMateriaCurso } from '@/lib/hooks/useMateriaCurso';

import { NivelCurso, EspecialidadCurso } from '@/lib/types/curso.types';
import { NivelEducativo, Materia, EstadoMateria, TipoCalificacion } from '@/lib/types/materia.types';
import { MateriaCurso } from '@/lib/types/materia-curso.types';

import { NivelSelector } from '@/lib/components/features/asignaciones/NivelSelector';
import { MateriasCard } from '@/lib/components/features/asignaciones/MateriasCard';
import { AsignarMateriaModal } from '@/lib/components/features/asignaciones/AsignarMateriaModal';
import { AsignarDocenteModal } from '@/lib/components/features/asignaciones/AsignarDocenteModal';

import { Card, CardContent } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/lib/components/ui/dialog';
import { Link2, Info, Plus, ArrowLeft, Loader2, AlertTriangle} from 'lucide-react';
import Link from 'next/link';

type NivelSeleccionado = {
  nivel: NivelCurso;
  especialidad?: EspecialidadCurso;
};

export default function AsignacionesPage() {
  const { cursos, isLoading: loadingCursos } = useCursos();
  const { materias, isLoading: loadingMaterias } = useMaterias();
  const { docentes, isLoading: loadingDocentes } = useDocentes();
  const { obtenerTodasMateriaCurso, eliminarMateriaCurso } = useMateriaCurso();
  const [materiaAEliminar, setMateriaAEliminar] = useState<Materia | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelSeleccionado>({
    nivel: NivelCurso.OCTAVO,
  });

  const [modalAgregarMateria, setModalAgregarMateria] = useState(false);
  const [modalAsignarDocente, setModalAsignarDocente] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);

  const [materiasCurso, setMateriasCurso] = useState<MateriaCurso[]>([]);
  const [loadingMateriaCurso, setLoadingMateriaCurso] = useState(true);

  const esBasica = [NivelCurso.OCTAVO, NivelCurso.NOVENO, NivelCurso.DECIMO].includes(
    nivelSeleccionado.nivel
  );

  const cursosFiltrados = cursos.filter((curso) => {
    if (esBasica) {
      return curso.nivel === nivelSeleccionado.nivel;
    }
    return (
      curso.nivel === nivelSeleccionado.nivel &&
      curso.especialidad === nivelSeleccionado.especialidad
    );
  });

  const paralelosCurso = cursosFiltrados.map((c) => c.paralelo).sort();
  const cursosIds = cursosFiltrados.map(c => c.id);

  useEffect(() => {
    cargarMateriaCurso();
  }, []);

  const cargarMateriaCurso = async () => {
    setLoadingMateriaCurso(true);
    try {
      const data = await obtenerTodasMateriaCurso();
      setMateriasCurso(data);
    } catch (error) {
      console.error('Error al cargar materia-curso:', error);
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoadingMateriaCurso(false);
    }
  };

  const materiasCursoFiltradas = materiasCurso.filter(mc =>
    cursosIds.includes(mc.curso_id)
  );

  const materiasYaAsignadas = new Set(
    materiasCursoFiltradas.map(mc => mc.materia_id)
  );

  const materiasFiltradas = esBasica
    ? materias.filter(
      (materia) =>
        materia.estado === EstadoMateria.ACTIVO &&
        materia.tipoCalificacion !== TipoCalificacion.CUALITATIVA &&
        (materia.nivelEducativo === NivelEducativo.BASICA ||
          materia.nivelEducativo === NivelEducativo.GENERAL)
    )
    : materias.filter(
      (materia) =>
        materia.estado === EstadoMateria.ACTIVO &&
        materia.tipoCalificacion !== TipoCalificacion.CUALITATIVA &&
        materiasYaAsignadas.has(materia.id)
    );

  const handleNivelChange = (nivel: NivelCurso, especialidad?: EspecialidadCurso) => {
    setNivelSeleccionado({ nivel, especialidad });
  };

  const getEstadoAsignacion = (materia: Materia) => {
    const totalParalelos = cursosFiltrados.length;

    const asignacionesMateria = materiasCursoFiltradas.filter(
      mc => mc.materia_id === materia.id
    );

    const asignados = asignacionesMateria.filter(mc => mc.docente_id !== null).length;
    const pendientes = asignacionesMateria.length - asignados;

    return {
      total: totalParalelos,
      asignados,
      pendientes,
    };
  };

  const getNivelLabel = () => {
    const nivelLabels: Record<NivelCurso, string> = {
      [NivelCurso.OCTAVO]: '8vo de Básica',
      [NivelCurso.NOVENO]: '9no de Básica',
      [NivelCurso.DECIMO]: '10mo de Básica',
      [NivelCurso.PRIMERO_BACHILLERATO]: '1ro de Bachillerato',
      [NivelCurso.SEGUNDO_BACHILLERATO]: '2do de Bachillerato',
      [NivelCurso.TERCERO_BACHILLERATO]: '3ro de Bachillerato',
    };

    const nivelLabel = nivelLabels[nivelSeleccionado.nivel];

    if (esBasica) {
      return nivelLabel;
    }

    const especialidadLabel =
      nivelSeleccionado.especialidad === EspecialidadCurso.TECNICO ? 'Técnico' : 'en Ciencias';
    return `${nivelLabel} ${especialidadLabel}`;
  };

  const getColorScheme = () => {
    if (esBasica) {
      return {
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        card: 'border-purple-200 hover:border-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700',
        info: 'bg-purple-50 border-l-purple-600',
        addButton: 'bg-purple-600 hover:bg-purple-700',
        paralelo: 'bg-purple-100 text-purple-800',
      };
    }
    if (nivelSeleccionado.especialidad === EspecialidadCurso.TECNICO) {
      return {
        badge: 'bg-orange-100 text-orange-800 border-orange-200',
        card: 'border-orange-200 hover:border-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700',
        info: 'bg-orange-50 border-l-orange-600',
        addButton: 'bg-orange-600 hover:bg-orange-700',
        paralelo: 'bg-orange-100 text-orange-800',
      };
    }
    return {
      badge: 'bg-green-100 text-green-800 border-green-200',
      card: 'border-green-200 hover:border-green-400',
      button: 'bg-green-600 hover:bg-green-700',
      info: 'bg-green-50 border-l-green-600',
      addButton: 'bg-green-600 hover:bg-green-700',
      paralelo: 'bg-green-100 text-green-800',
    };
  };

  const handleConfigurarMateria = (materia: Materia) => {
    setMateriaSeleccionada(materia);
    setModalAsignarDocente(true);
  };

  const handleAgregarMateria = () => {
    setModalAgregarMateria(true);
  };

  const handleEliminarMateria = (materia: Materia) => {
    setMateriaAEliminar(materia);
  };

  const confirmarEliminarMateria = async () => {
    if (!materiaAEliminar) return;

    setEliminando(true);
    try {
      const idsParaEliminar = materiasCursoFiltradas
        .filter(mc => mc.materia_id === materiaAEliminar.id)
        .map(mc => mc.id);

      if (idsParaEliminar.length === 0) {
        toast.error('No hay asignaciones para eliminar');
        return;
      }

      await Promise.all(
        idsParaEliminar.map(id => eliminarMateriaCurso(id))
      );

      toast.success(`Materia "${materiaAEliminar.nombre}" eliminada de ${idsParaEliminar.length} paralelo(s)`);
      await cargarMateriaCurso();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar materia');
    } finally {
      setEliminando(false);
      setMateriaAEliminar(null);
    }
  };

  const handleSaveAsignaciones = async () => {
    await cargarMateriaCurso();
  };

  const handleSaveMateria = async () => {
    await cargarMateriaCurso();
  };

  const colors = getColorScheme();

  if (loadingCursos || loadingMaterias || loadingDocentes || loadingMateriaCurso) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const niveleducativoFiltro = [NivelEducativo.BACHILLERATO, NivelEducativo.GENERAL];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Link2 className="w-8 h-8" />
              Asignación de Materias a Cursos
            </h1>
            <p className="text-gray-600">
              {esBasica
                ? 'Las materias de básica se asignan automáticamente. Asigna docentes por paralelo.'
                : 'Agrega materias manualmente y asigna docentes por paralelo.'}
            </p>
          </div>
        </div>

        <NivelSelector nivelSeleccionado={nivelSeleccionado} onNivelChange={handleNivelChange} />

        <Card className={`${colors.info} border-l-4`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold mb-2">Configurando: {getNivelLabel()}</p>

                {cursosFiltrados.length === 0 ? (
                  <p className="text-sm">No hay paralelos registrados para este nivel</p>
                ) : (
                  <div>
                    <p className="text-sm mb-2">
                      {cursosFiltrados.length} paralelo(s) disponible(s):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {paralelosCurso.map((paralelo) => (
                        <Badge key={paralelo} className={colors.paralelo}>
                          {paralelo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {esBasica && (
                  <p className="text-sm mt-3 opacity-80">
                    Las materias de básica ya están definidas. Solo configura los docentes.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {esBasica ? 'Materias del Nivel' : 'Materias Asignadas'}
          </h2>
          {!esBasica && (
            <Button onClick={handleAgregarMateria} className={colors.addButton}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Materia
            </Button>
          )}
        </div>

        {materiasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {esBasica ? (
                <div>
                  <p className="mb-2">No hay materias configuradas para básica.</p>
                  <p className="text-sm">
                    Las materias deben crearse con nivelEducativo <strong>BÁSICA</strong> o{' '}
                    <strong>GENERAL</strong>.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2">No hay materias asignadas a este nivel.</p>
                  <p className="text-sm">
                    Haz clic en <strong>"Agregar Materia"</strong> para comenzar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materiasFiltradas.map((materia) => {
              const estado = getEstadoAsignacion(materia);
              return (
                <MateriasCard
                  key={materia.id}
                  materia={materia}
                  totalParalelos={estado.total}
                  asignados={estado.asignados}
                  colors={colors}
                  esBasica={esBasica}
                  onConfigurar={handleConfigurarMateria}
                  onEliminar={handleEliminarMateria}
                />
              );
            })}
          </div>
        )}
      </div>

            {/* Modal de confirmación para eliminar materia */}
      <Dialog open={!!materiaAEliminar} onOpenChange={(open) => !open && setMateriaAEliminar(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Eliminar materia del nivel</DialogTitle>
                <DialogDescription className="mt-1">
                  Esta acción no se puede deshacer
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              ¿Estás seguro de eliminar <strong>&quot;{materiaAEliminar?.nombre}&quot;</strong> de
              todos los paralelos de <strong>{getNivelLabel()}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Se eliminarán las asignaciones de docentes asociadas a esta materia en este nivel.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setMateriaAEliminar(null)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarEliminarMateria}
              disabled={eliminando}
            >
              {eliminando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar materia'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!esBasica && (
        <AsignarMateriaModal
          open={modalAgregarMateria}
          onClose={() => setModalAgregarMateria(false)}
          cursos={cursosFiltrados}
          nivelEducativo={niveleducativoFiltro}
          materiasYaAsignadas={materiasYaAsignadas}
          onSave={handleSaveMateria}
        />
      )}

      <AsignarDocenteModal
        open={modalAsignarDocente}
        onClose={() => {
          setModalAsignarDocente(false);
          setMateriaSeleccionada(null);
        }}
        materia={materiaSeleccionada}
        cursos={cursosFiltrados}
        docentes={docentes}
        onSave={handleSaveAsignaciones}
      />
    </>
  );
}