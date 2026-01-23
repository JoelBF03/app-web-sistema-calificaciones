'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Skeleton } from '@/lib/components/ui/skeleton';
import { ArrowLeft, CalendarRange, Plus, CheckCircle2, Clock } from 'lucide-react';
import { usePeriodos } from '@/lib/hooks/usePeriodos';
import { useTrimestres } from '@/lib/hooks/useTrimestres';
import { EstadoPeriodo } from '@/lib/types/periodo.types';
import PeriodoCard from '@/lib/components/features/periodos/PeriodoCard';
import CreatePeriodoWizard from '@/lib/components/features/periodos/wizard/CreatePeriodoWizard';

export default function PeriodosPage() {
  const { 
    periodos, 
    loading, 
    fetchPeriodos, 
    actualizarPeriodo, 
    cambiarEstadoPeriodo,
    activarSupletorios,
    cerrarSupletorios,
    reabrirSupletorios
  } = usePeriodos();
  const { actualizarTrimestre } = useTrimestres();
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  useEffect(() => {
    fetchPeriodos();
  }, [fetchPeriodos]);

  const sortedPeriodos = [...periodos].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activePeriodos = periodos.filter(p => p.estado === EstadoPeriodo.ACTIVO).length;
  const finalizadosPeriodos = periodos.filter(p => p.estado === EstadoPeriodo.FINALIZADO).length;

  if (loading && periodos.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
        </Card>
        
        <div className="grid gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Volver al panel de administración"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>

                <CalendarRange className="w-8 h-8 text-blue-600" />

                <div>
                  <CardTitle className="text-3xl">Períodos Lectivos</CardTitle>
                  <CardDescription className="mt-1">
                    Gestiona los períodos académicos, trimestres y porcentajes de evaluación
                  </CardDescription>
                </div>
              </div>

              <Button 
                onClick={() => setShowCreateWizard(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Nuevo Período
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Estadísticas */}
        {periodos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-900">{activePeriodos}</p>
                    <p className="text-sm text-green-700 font-medium">Períodos Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{finalizadosPeriodos}</p>
                    <p className="text-sm text-gray-700 font-medium">Períodos Finalizados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CalendarRange className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-900">{periodos.length}</p>
                    <p className="text-sm text-blue-700 font-medium">Total de Períodos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Períodos */}
        {sortedPeriodos.length > 0 ? (
          <div className="space-y-6">
            {sortedPeriodos.map((periodo) => (
              <PeriodoCard
                key={periodo.id}
                periodo={periodo}
                onUpdate={actualizarPeriodo}
                onUpdateTrimestre={actualizarTrimestre}
                onCambiarEstado={cambiarEstadoPeriodo}
                onActivarSupletorios={activarSupletorios}
                onCerrarSupletorios={cerrarSupletorios}
                onReabrirSupletorios={reabrirSupletorios}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 border-dashed border-2">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-600 to-yellow-500 flex items-center justify-center shadow-lg">
                  <CalendarRange className="h-12 w-12 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl mb-2">No hay períodos lectivos</CardTitle>
                  <CardDescription className="mb-6 max-w-md mx-auto">
                    Aún no hay períodos lectivos registrados en el sistema.
                    Crea el primer período para comenzar a gestionar trimestres y evaluaciones.
                  </CardDescription>
                  <Button 
                    onClick={() => setShowCreateWizard(true)} 
                    className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Período
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Wizard de creación */}
      <CreatePeriodoWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onSuccess={fetchPeriodos}
      />
    </>
  );
}