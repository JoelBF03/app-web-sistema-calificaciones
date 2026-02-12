'use client';

import { useState, useCallback, useEffect } from 'react';
import { useEstudiantes } from '@/lib/hooks/useEstudiantes';
import type { Estudiante, EstadoEstudiante } from '@/lib/types/estudiante.types';

import { EstadisticasEstudiantes } from '@/lib/components/features/estudiantes/EstadisticasEstudiantes';
import { FiltrosEstudiantes } from '@/lib/components/features/estudiantes/FiltrosEstudiantes';
import { TablaEstudiantes } from '@/lib/components/features/estudiantes/TablaEstudiantes';
import { ModalDetallesEstudiante } from '@/lib/components/features/estudiantes/ModalDetallesEstudiante';
import { ModalEditarEstudiante } from '@/lib/components/features/estudiantes/ModalEditarEstudiante';
import { ModalHistorialEstudiante } from '@/lib/components/features/estudiantes/ModalHistorialEstudiante';
import { ModalRetirarEstudiante } from '@/lib/components/features/estudiantes/ModalRetirarEstudiante';
import { ModalReactivarEstudiante } from '@/lib/components/features/estudiantes/ModalReactivarEstudiante';
import { Card, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function EstudiantesPage() {
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    search: '',
    estado: 'ACTIVO' as EstadoEstudiante | 'ALL',
    incompletos: 'ALL' as 'ALL' | 'true' | 'false',
  });

  const [page, setPage] = useState(1);
  const [searchDebounce, setSearchDebounce] = useState('');

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
  } = useEstudiantes({
    search: searchDebounce,
    estado: filtros.estado === 'ALL' ? '' : filtros.estado,
    incompletos: filtros.incompletos === 'ALL' ? undefined : filtros.incompletos === 'true',
    page,
    limit: 20,
  });

  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalHistorial, setShowModalHistorial] = useState(false);
  const [showModalRetirar, setShowModalRetirar] = useState(false);
  const [showModalReactivar, setShowModalReactivar] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Estudiante | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filtros.search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros.search]);

  useEffect(() => {
    setPage(1);
  }, [filtros.estado, filtros.incompletos]);

  const handleVerDetalles = useCallback(async (estudiante: Estudiante) => {
    try {
      const estudianteCompleto = await obtenerEstudiante(estudiante.id);
      setEstudianteSeleccionado(estudianteCompleto);
      setShowModalDetalles(true);
    } catch (error) {
      toast.error('Error al obtener estudiante');
    }
  }, [obtenerEstudiante]);

  const handleEditar = useCallback(async (estudiante: Estudiante) => {
    try {
      const estudianteCompleto = await obtenerEstudiante(estudiante.id);
      setEstudianteSeleccionado(estudianteCompleto);
      setShowModalEditar(true);
    } catch (error) {
      toast.error('Error al obtener estudiante');
    }
  }, [obtenerEstudiante]);

  const handleVerHistorial = useCallback(async (estudiante: Estudiante) => {
    try {
      const estudianteCompleto = await obtenerEstudiante(estudiante.id);
      setEstudianteSeleccionado(estudianteCompleto);
      setShowModalHistorial(true);
    } catch (error) {
      toast.error('Error al obtener estudiante');
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

  const handleSaveEditar = useCallback(async (id: string, data: any) => {
    await actualizarEstudiante(id, data);
    setShowModalEditar(false);
    setEstudianteSeleccionado(null);
  }, [actualizarEstudiante]);

  const handleConfirmRetirar = useCallback(async (id: string, motivo?: string) => {
    await retirarEstudiante(id, motivo);
    setShowModalRetirar(false);
    setEstudianteSeleccionado(null);
  }, [retirarEstudiante]);

  const handleConfirmReactivar = useCallback(async (id: string) => {
    await reactivarEstudiante(id);
    setShowModalReactivar(false);
    setEstudianteSeleccionado(null);
  }, [reactivarEstudiante]);

  const handleEditarDesdeDetalles = useCallback(() => {
    setShowModalDetalles(false);
    setShowModalEditar(true);
  }, []);

  const handleRetirarDesdeDetalles = useCallback(() => {
    setShowModalDetalles(false);
    setShowModalRetirar(true);
  }, []);

  return (
    <div className="space-y-6">
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

              <GraduationCap className="w-8 h-8 text-blue-600" />

              <div>
                <CardTitle className="text-3xl">Gestión de Estudiantes</CardTitle>
                <CardDescription>
                  Aquí encontrarás toda la información relacionada con los estudiantes registrados en el sistema
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      <EstadisticasEstudiantes estadisticas={estadisticas} />

      <FiltrosEstudiantes
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      <TablaEstudiantes
        estudiantes={estudiantes}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        onVerDetalles={handleVerDetalles}
        onEditar={handleEditar}
        onVerHistorial={handleVerHistorial}
        onReactivar={handleReactivar}
      />

      {estudianteSeleccionado && (
        <>
          <ModalDetallesEstudiante
            estudiante={estudianteSeleccionado}
            isOpen={showModalDetalles}
            onClose={() => setShowModalDetalles(false)}
            onEditar={handleEditarDesdeDetalles}
            onRetirar={handleRetirarDesdeDetalles}
          />

          <ModalEditarEstudiante
            estudiante={estudianteSeleccionado}
            isOpen={showModalEditar}
            onClose={() => setShowModalEditar(false)}
            onSave={handleSaveEditar}
          />

          <ModalHistorialEstudiante
            estudiante={estudianteSeleccionado}
            isOpen={showModalHistorial}
            onClose={() => setShowModalHistorial(false)}
          />

          <ModalRetirarEstudiante
            estudiante={estudianteSeleccionado}
            isOpen={showModalRetirar}
            onClose={() => setShowModalRetirar(false)}
            onConfirm={handleConfirmRetirar}
          />

          <ModalReactivarEstudiante
            estudiante={estudianteSeleccionado}
            isOpen={showModalReactivar}
            onClose={() => setShowModalReactivar(false)}
            onConfirm={handleConfirmReactivar}
          />
        </>
      )}
    </div>
  );
}