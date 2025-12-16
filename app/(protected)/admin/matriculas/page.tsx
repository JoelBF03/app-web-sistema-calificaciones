'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMatriculas } from '@/lib/hooks/useMatriculas';
import { FiltrosMatriculas } from '@/lib/components/features/matriculas/FiltrosMatriculas';
import { TablaMatriculas } from '@/lib/components/features/matriculas/TablaMatriculas';
import { EstadisticasMatriculas } from '@/lib/components/features/matriculas/EstadisticasMatriculas';
import { ModalCrearManual } from '@/lib/components/features/matriculas/ModalMatriculaManual';
import { ModalDetalles } from '@/lib/components/features/matriculas/ModalDetalles';
import { ModalEditar } from '@/lib/components/features/matriculas/ModalEditar';
import { ModalRetirar } from '@/lib/components/features/matriculas/ModalRetirar';
import { ModalImportarExcel } from '@/lib/components/features/matriculas/ModalImportarExcel';
import type { CreateMatriculaDto, Matricula, UpdateMatriculaDto } from '@/lib/types/matricula.types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { ArrowLeft, BookOpen, GraduationCap, UserPlus } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';

export default function MatriculasPage() {
  const { matriculas, loading, error, fetchMatriculas, crearMatricula, actualizarMatricula, retirarEstudiante, reactivarEstudiante } = useMatriculas();
  const [filtros, setFiltros] = useState({
    periodoId: '',
    cursoId: '',
    busqueda: ''
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  const [showModalManual, setShowModalManual] = useState(false);
  const [showModalImportar, setShowModalImportar] = useState(false);
  const [showModalDetalles, setShowModalDetalles] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalRetirar, setShowModalRetirar] = useState(false);
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState<Matricula | null>(null);

  useEffect(() => {
    fetchMatriculas();
  }, [fetchMatriculas]);

  const handleFiltrar = () => {
    if (!filtros.periodoId || !filtros.cursoId) {
      alert('Por favor seleccione un Período Lectivo y un Curso');
      return;
    }
    setFiltrosAplicados(true);
  };

  const handleMatricularManual = () => {
    setShowModalManual(true);
  };

  const handleImportarExcel = () => {
    setShowModalImportar(true);
  };

  const handleVerDetalles = (matricula: Matricula) => {
    setMatriculaSeleccionada(matricula);
    setShowModalDetalles(true);
  };

  const handleEditar = (matricula: Matricula) => {
    setMatriculaSeleccionada(matricula);
    setShowModalEditar(true);
  };

  const handleRetirar = (matricula: Matricula) => {
    setMatriculaSeleccionada(matricula);
    setShowModalRetirar(true);
  };

  const handleSaveEditar = async (id: string, data: UpdateMatriculaDto) => {
    await actualizarMatricula(id, data);
    await fetchMatriculas();
  };

  const handleConfirmRetirar = async (id: string, motivo: string) => {
    await retirarEstudiante(id, motivo);
    await fetchMatriculas();
  };

  const handleSaveManual = async (data: CreateMatriculaDto) => {
    await crearMatricula(data);
    await fetchMatriculas();
  };

  const handleReactivar = async (matricula: Matricula) => {
    try {
      await reactivarEstudiante(matricula.id);
      await fetchMatriculas();
      alert('Estudiante reactivado exitosamente');
    } catch (error: any) {
      alert(error.message || 'Error al reactivar estudiante');
    }
  };

  const matriculasFiltradas = !filtrosAplicados
    ? []
    : matriculas.filter(m => {
      const cumplePeriodo = m.periodo_lectivo_id.toString() === filtros.periodoId;
      const cumpleCurso = m.curso_id.toString() === filtros.cursoId;

      if (!cumplePeriodo) return false;
      if (!cumpleCurso) return false;

      if (filtros.busqueda) {
        const busquedaLower = filtros.busqueda.toLowerCase();
        const coincideCedula = m.estudiante_cedula.toLowerCase().includes(busquedaLower);
        const coincideNombre = m.nombres_completos.toLowerCase().includes(busquedaLower);

        if (!coincideCedula && !coincideNombre) {
          return false;
        }
      }

      return true;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
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
                <CardTitle className="text-3xl">Gestión de Matrículas</CardTitle>
                <CardDescription>
                  Administra las matrículas de estudiantes por período y curso
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estadísticas */}
      <EstadisticasMatriculas matriculas={matriculas} />

      {/* Filtros */}
      <FiltrosMatriculas
        filtros={filtros}
        onChange={setFiltros}
        onFiltrar={handleFiltrar}
        onMatricularManual={handleMatricularManual}
        onImportarExcel={handleImportarExcel}
      />

      {/* Tabla */}
      <TablaMatriculas
        matriculas={matriculasFiltradas}
        loading={loading}
        error={error}
        cursoSeleccionado={filtros.cursoId}
        onVerDetalles={handleVerDetalles}
        onEditar={handleEditar}
        onRetirar={handleRetirar}
      />

      {/* Modales */}
      {showModalManual && (
        <ModalCrearManual
          onClose={() => setShowModalManual(false)}
          onSave={handleSaveManual}
        />
      )}

      {showModalImportar && (
        <ModalImportarExcel
          onClose={() => setShowModalImportar(false)}
          onSuccess={() => {
            fetchMatriculas();
            setShowModalImportar(false);
          }}
        />
      )}

      {showModalDetalles && matriculaSeleccionada && (
        <ModalDetalles
          matricula={matriculaSeleccionada}
          onClose={() => setShowModalDetalles(false)}
        />
      )}

      {showModalEditar && matriculaSeleccionada && (
        <ModalEditar
          matricula={matriculaSeleccionada}
          onClose={() => setShowModalEditar(false)}
          onSave={handleSaveEditar}
        />
      )}

      {showModalRetirar && matriculaSeleccionada && (
        <ModalRetirar
          matricula={matriculaSeleccionada}
          onClose={() => setShowModalRetirar(false)}
          onConfirm={handleConfirmRetirar}
        />
      )}

      {showModalDetalles && matriculaSeleccionada && (
        <ModalDetalles
          matricula={matriculaSeleccionada}
          onClose={() => {
            setShowModalDetalles(false);
            setMatriculaSeleccionada(null);
          }}
          onReactivar={handleReactivar}
        />
      )}

    </div>
  );
}