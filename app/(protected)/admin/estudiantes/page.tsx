'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useEstudiantes } from '@/lib/hooks/useEstudiantes';
import { Estudiante, EstadoEstudiante } from '@/lib/types/estudiante.types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { ArrowLeft, UserCircle } from 'lucide-react';

// Componentes
import { EstadisticasEstudiantes } from '@/lib/components/features/estudiantes/EstadisticasEstudiantes';
import { FiltrosEstudiantes } from '@/lib/components/features/estudiantes/FiltrosEstudiantes';
import { TablaEstudiantes } from '@/lib/components/features/estudiantes/TablaEstudiantes';
import { ModalDetallesEstudiante } from '@/lib/components/features/estudiantes/ModalDetallesEstudiante';
import { ModalEditarEstudiante } from '@/lib/components/features/estudiantes/ModalEditarEstudiante';
import { ModalHistorialEstudiante } from '@/lib/components/features/estudiantes/ModalHistorialEstudiante';
import { ModalRetirarEstudiante } from '@/lib/components/features/estudiantes/ModalRetirarEstudiante';
import { ModalReactivarEstudiante } from '@/lib/components/features/estudiantes/ModalReactivarEstudiante';

export default function EstudiantesPage() {
  const {
    estudiantes,
    estadisticas,
    pagination,
    isLoading,
    error,
    fetchEstudiantes,
    fetchEstadisticas,
    obtenerEstudiante,
    actualizarEstudiante,
    retirarEstudiante,
    reactivarEstudiante,
  } = useEstudiantes();

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    search: '',
    estado: 'ACTIVO' as EstadoEstudiante | 'ALL',
    incompletos: 'ALL',
    nivelCurso: undefined as string | undefined,
    periodoId: undefined as string | undefined,
  });

  // Debounce para búsqueda
  const [searchDebounce, setSearchDebounce] = useState('');

  // Estados para modales
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalHistorial, setShowModalHistorial] = useState(false);
  const [showModalRetirar, setShowModalRetirar] = useState(false);
  const [showModalReactivar, setShowModalReactivar] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  // Cargar estudiantes cuando cambian los filtros
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounce(filtros.search);
    }, 300); // Debounce de 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [filtros.search]);

  useEffect(() => {
    const params: any = {
      page: pagination.page,
      limit: 20,
    };
    if (filtros.estado !== 'ALL') {
      params.estado = filtros.estado;
    }

    if (searchDebounce) {
      params.search = searchDebounce;
    }

    if (filtros.incompletos !== 'ALL') {
      params.incompletos = filtros.incompletos === 'true';
    }

    if (filtros.nivelCurso) {
      params.nivelCurso = filtros.nivelCurso;
    }

    if (filtros.periodoId) {
      params.periodoId = filtros.periodoId;
    }

    fetchEstudiantes(params);
  }, [searchDebounce, filtros.estado, filtros.incompletos, filtros.nivelCurso, filtros.periodoId, pagination.page, fetchEstudiantes]);

  // Handlers de modales
  const handleVerDetalles = useCallback(async (estudiante: Estudiante) => {
    try {
      // Obtener datos completos del estudiante con relaciones
      const estudianteCompleto = await obtenerEstudiante(estudiante.id);
      setEstudianteSeleccionado(estudianteCompleto);
      setShowModalDetalles(true);
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
    }
  }, [obtenerEstudiante]);

  const handleEditar = useCallback(async (estudiante: Estudiante) => {
    try {
      const estudianteCompleto = await obtenerEstudiante(estudiante.id);
      setEstudianteSeleccionado(estudianteCompleto);
      setShowModalEditar(true);
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
    }
  }, [obtenerEstudiante]);

  const handleVerHistorial = useCallback(async (estudiante: Estudiante) => {
    try {
      const estudianteCompleto = await obtenerEstudiante(estudiante.id);
      setEstudianteSeleccionado(estudianteCompleto);
      setShowModalHistorial(true);
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
    }
  }, [obtenerEstudiante]);

  const handleRetirar = useCallback((estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setShowModalRetirar(true);
  }, []);

  const handleReactivar = useCallback((estudiante: Estudiante) => {
    setEstudianteSeleccionado(estudiante);
    setShowModalReactivar(true);
  }, []);

  // Handlers de acciones
  const handleSaveEditar = useCallback(async (id: string, data: any) => {
    await actualizarEstudiante(id, data);
    await fetchEstadisticas();
    setShowModalEditar(false);
    setEstudianteSeleccionado(null);
  }, [actualizarEstudiante, fetchEstadisticas]);

  const handleConfirmRetirar = useCallback(async (id: string, motivo?: string) => {
    await retirarEstudiante(id, motivo);
    await fetchEstadisticas();
    setShowModalRetirar(false);
    setEstudianteSeleccionado(null);
  }, [retirarEstudiante, fetchEstadisticas]);

  const handleConfirmReactivar = useCallback(async (id: string) => {
    await reactivarEstudiante(id);
    await fetchEstadisticas();
    setShowModalReactivar(false);
    setEstudianteSeleccionado(null);
  }, [reactivarEstudiante, fetchEstadisticas]);

  // Handler de paginación
  const handlePageChange = useCallback((page: number) => {
    const params: any = {
      page,
      limit: 20,
    };

    if (filtros.estado !== 'ALL') {
      params.estado = filtros.estado;
    }

    if (searchDebounce) {
      params.search = searchDebounce;
    }

    if (filtros.incompletos !== 'ALL') {
      params.incompletos = filtros.incompletos === 'true';
    }

    // ✅ AGREGAR LOS FILTROS DE CURSO Y PERIODO
    if (filtros.nivelCurso) {
      params.nivelCurso = filtros.nivelCurso;
    }

    if (filtros.periodoId) {
      params.periodoId = filtros.periodoId;
    }

    fetchEstudiantes(params);
  }, [filtros, searchDebounce, fetchEstudiantes]);

  // Handler para abrir modal de editar desde modal de detalles
  const handleEditarDesdeDetalles = useCallback(() => {
    setShowModalDetalles(false);
    setShowModalEditar(true);
  }, []);

  // Handler para abrir modal de retirar desde modal de detalles
  const handleRetirarDesdeDetalles = useCallback(() => {
    setShowModalDetalles(false);
    setShowModalRetirar(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
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

              <UserCircle className="w-8 h-8 text-blue-600" />

              <div>
                <CardTitle className="text-3xl">Gestión de Estudiantes</CardTitle>
                <CardDescription>
                  Administra la información personal y académica de los estudiantes
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ESTADÍSTICAS */}
      <EstadisticasEstudiantes estadisticas={estadisticas} />

      {/* FILTROS */}
      <FiltrosEstudiantes
        filtros={filtros}
        onChange={setFiltros}
      />

      {/* TABLA */}
      <TablaEstudiantes
        estudiantes={estudiantes}
        loading={isLoading}
        pagination={pagination}
        onVerDetalles={handleVerDetalles}
        onEditar={handleEditar}
        onVerHistorial={handleVerHistorial}
        onReactivar={handleReactivar}
        onPageChange={handlePageChange}
      />

      {/* MODALES */}
      {showModalDetalles && estudianteSeleccionado && (
        <ModalDetallesEstudiante
          estudiante={estudianteSeleccionado}
          onClose={() => {
            setShowModalDetalles(false);
            setEstudianteSeleccionado(null);
          }}
          onEditar={handleEditarDesdeDetalles}
          onRetirar={handleRetirarDesdeDetalles}
        />
      )}

      {showModalEditar && estudianteSeleccionado && (
        <ModalEditarEstudiante
          estudiante={estudianteSeleccionado}
          onClose={() => {
            setShowModalEditar(false);
            setEstudianteSeleccionado(null);
          }}
          onSave={handleSaveEditar}
        />
      )}

      {showModalHistorial && estudianteSeleccionado && (
        <ModalHistorialEstudiante
          estudiante={estudianteSeleccionado}
          onClose={() => {
            setShowModalHistorial(false);
            setEstudianteSeleccionado(null);
          }}
        />
      )}

      {showModalRetirar && estudianteSeleccionado && (
        <ModalRetirarEstudiante
          estudiante={estudianteSeleccionado}
          onClose={() => {
            setShowModalRetirar(false);
            setEstudianteSeleccionado(null);
          }}
          onConfirm={handleConfirmRetirar}
        />
      )}

      {showModalReactivar && estudianteSeleccionado && (
        <ModalReactivarEstudiante
          estudiante={estudianteSeleccionado}
          onClose={() => {
            setShowModalReactivar(false);
            setEstudianteSeleccionado(null);
          }}
          onConfirm={handleConfirmReactivar}
        />
      )}
    </div>
  );
}