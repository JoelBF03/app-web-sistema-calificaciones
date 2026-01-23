'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/lib/components/ui/button';
import {
  Plus,
  RefreshCw,
  ArrowLeft,
  Loader2,
  LayoutGrid,
  List,
  LibraryBig
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';

import CreateCursoDialog from '@/lib/components/features/cursos/CreateCursoDialog';
import CursoDetailsModal from '@/lib/components/features/cursos/CursoDetailsModal';
import EditCursoModal from '@/lib/components/features/cursos/EditCursoModal';
import CursosFilters from '@/lib/components/features/cursos/CursosFilters';
import CursoCard from '@/lib/components/features/cursos/CursoCard';
import CursosCompactView from '@/lib/components/features/cursos/CursoCompactView';

import { useCursos } from '@/lib/hooks/useCursos';
import {
  NivelCurso,
  NIVEL_DISPLAY_MAP,
  Curso,
} from '@/lib/types/curso.types';

import { Docente } from '@/lib/types/docente.types';
import DocenteDetailsModal from '@/lib/components/features/docentes/DocenteDetailsModal';

import { Card, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import MateriasDelCursoModal from '@/lib/components/features/cursos/MateriasDelCursoModal';

type ViewMode = 'cards' | 'compact';

export default function CursosPage() {
  const { cursos, stats, loading, loadData, actualizarCurso, cambiarEstado } = useCursos();

  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadFilter, setEspecialidadFilter] = useState('all');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [showMateriasModal, setShowMateriasModal] = useState(false);

  // 🆕 Estados para modales
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortCursos = (cursos: Curso[]) => {
    return [...cursos].sort((a, b) => {
      const ordenNiveles: Record<NivelCurso, number> = {
        [NivelCurso.OCTAVO]: 1,
        [NivelCurso.NOVENO]: 2,
        [NivelCurso.DECIMO]: 3,
        [NivelCurso.PRIMERO_BACHILLERATO]: 4,
        [NivelCurso.SEGUNDO_BACHILLERATO]: 5,
        [NivelCurso.TERCERO_BACHILLERATO]: 6
      };

      const ordenA = ordenNiveles[a.nivel];
      const ordenB = ordenNiveles[b.nivel];

      if (ordenA !== ordenB) return ordenA - ordenB;
      if (a.especialidad !== b.especialidad) return a.especialidad.localeCompare(b.especialidad);
      return a.paralelo.localeCompare(b.paralelo);
    });
  };

  const filteredCursos = useMemo(() => {
    return cursos.filter(curso => {
      const searchMatch = searchTerm === '' ||
        NIVEL_DISPLAY_MAP[curso.nivel].toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.paralelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        curso.periodo_lectivo.nombre.toLowerCase().includes(searchTerm.toLowerCase());

      const especialidadMatch = especialidadFilter === 'all' || curso.especialidad === especialidadFilter;
      const estadoMatch = estadoFilter === 'all' || curso.estado === estadoFilter;

      return searchMatch && especialidadMatch && estadoMatch;
    });
  }, [cursos, searchTerm, especialidadFilter, estadoFilter]);

  const cursosOrdenados = useMemo(() => sortCursos(filteredCursos), [filteredCursos]);

  const statsEspecialidad = useMemo(() => {
    return {
      totalCursos: cursos.length,
      cursosBasica: cursos.filter(c => c.especialidad === 'BASICA').length,
      cursosTecnico: cursos.filter(c => c.especialidad === 'TECNICO').length,
      cursosCiencias: cursos.filter(c => c.especialidad === 'CIENCIAS').length,
    };
  }, [cursos]);

  const clearFilters = () => {
    setEspecialidadFilter('all');
    setEstadoFilter('all');
    setSearchTerm('');
  };

  const handleToggleEstado = async (curso: Curso) => {
    await cambiarEstado(curso.id);
  };

  const handleCreateSuccess = () => {
    loadData();
    setShowCreateDialog(false);
  };

  // 🆕 Handlers de modales
  const handleViewDetails = (curso: Curso) => {
    setSelectedCurso(curso);
    setShowDetailsModal(true);
  };

  const handleEditFromDetails = (curso: Curso) => {
    setShowDetailsModal(false);
    setTimeout(() => {
      setSelectedCurso(curso);
      setShowEditModal(true);
    }, 0);
  };

  const handleEdit = (curso: Curso) => {
    setSelectedCurso(curso);
    setShowEditModal(true);
  };

  const handleViewDocente = (docente: Curso['docente']) => {
    if (!docente) return;
    setSelectedDocente(docente);
  };

  const handleViewMaterias = (curso: Curso) => {
    setSelectedCurso(curso);
    setShowMateriasModal(true);
  };

  const handleSaveEdit = async (id: string, data: any) => {
    const cursoActualizado = await actualizarCurso(id, data);
    setSelectedCurso(cursoActualizado);
    setShowEditModal(false);
  };

  if (loading && cursos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header*/}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>

              <LibraryBig className="w-8 h-8 text-blue-600" />

              <div>
                <CardTitle className="text-3xl">Cursos</CardTitle>
                <CardDescription>
                  Administra los cursos del periodo lectivo actual
                </CardDescription>
              </div>
            </div>

            <Button onClick={() => setShowCreateDialog(true)} className="flex cursor-pointer items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Curso
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ESTADÍSTICAS OPTIMIZADAS */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Cursos</p>
              <p className="text-3xl font-bold">{statsEspecialidad.totalCursos}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <LayoutGrid className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Ed. Básica</p>
              <p className="text-3xl font-bold">{statsEspecialidad.cursosBasica}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Bach. Técnico</p>
              <p className="text-3xl font-bold">{statsEspecialidad.cursosTecnico}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-black">TEC</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Bach. Ciencias</p>
              <p className="text-3xl font-bold">{statsEspecialidad.cursosCiencias}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-black">CIE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros + Selector de Vista */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex-1 w-full">
          <CursosFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            especialidadFilter={especialidadFilter}
            setEspecialidadFilter={setEspecialidadFilter}
            estadoFilter={estadoFilter}
            setEstadoFilter={setEstadoFilter}
            onClearFilters={clearFilters}
            stats={statsEspecialidad}
          />
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="cards" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline cursor-pointer">Cards</span>
            </TabsTrigger>
            <TabsTrigger value="compact" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline cursor-pointer">Compacta</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenido según vista */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cursosOrdenados.map((curso) => (
            <CursoCard
              key={curso.id}
              curso={curso}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onToggleEstado={handleToggleEstado}
            />
          ))}
        </div>
      )}

      {viewMode === 'compact' && (
        <CursosCompactView
          cursos={cursosOrdenados}
          onToggleEstado={handleToggleEstado}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      )}

      {/* MODALES */}
      <CreateCursoDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />

      <CursoDetailsModal
        curso={selectedCurso}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCurso(null);
        }}
        onEdit={handleEditFromDetails}
        onViewDocente={handleViewDocente}
        onViewMaterias={handleViewMaterias}
      />

      <DocenteDetailsModal
        docenteId={selectedDocente?.id || null}
        isOpen={!!selectedDocente}
        onClose={() => setSelectedDocente(null)}
      />

      <EditCursoModal
        curso={selectedCurso}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setTimeout(() => {
            setSelectedCurso(null);
          }, 100);
        }}
        onSave={handleSaveEdit}
      />

      <MateriasDelCursoModal
        curso={selectedCurso}
        isOpen={showMateriasModal}
        onClose={() => {
          setShowMateriasModal(false);
          setSelectedCurso(null);
        }}
      />
    </div>
  );
}