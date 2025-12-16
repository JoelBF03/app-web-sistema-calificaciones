'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { ArrowLeft, CalendarRange, Plus } from 'lucide-react';
import { usePeriodos } from '@/lib/hooks/usePeriodos';
import { useTrimestres } from '@/lib/hooks/useTrimestres';
import { EstadoPeriodo } from '@/lib/types/periodo.types';
import PeriodoCard from '@/lib/components/features/periodos/PeriodoCard';
import CreatePeriodoDialog from '@/lib/components/features/periodos/CreatePeriodoDialog';

export default function PeriodosPage() {
  const { periodos, loading, fetchPeriodos, actualizarPeriodo } = usePeriodos();
  const { actualizarTrimestre } = useTrimestres();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchPeriodos();
  }, [fetchPeriodos]);

  const sortedPeriodos = periodos.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const activePeriodos = periodos.filter(p => p.estado === EstadoPeriodo.ACTIVO).length;

  if (loading && periodos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-green-600 font-medium">Cargando períodos lectivos...</span>
        </div>
      </div>
    );
  }

  return (
    <>
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

                        <CalendarRange className="w-8 h-8 text-blue-600" />

                        <div>
                            <CardTitle className="text-3xl">Períodos Lectivos</CardTitle>
                            <CardDescription>
                                Administra los períodos lectivos del sistema
                            </CardDescription>
                        </div>
                    </div>

                    <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4" />
                        Nuevo Período
                    </Button>
                </div>
            </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent>
            <CardDescription className="text-blue-700">
              Haz clic en "Trimestres del Período" para expandir cada período y ver sus trimestres.
              Puedes editar tanto períodos como trimestres directamente desde esta vista.
            </CardDescription>
          </CardContent>
        </Card>

        {sortedPeriodos.length > 0 ? (
          <div className="space-y-6">
            {sortedPeriodos.map((periodo) => (
              <PeriodoCard
                key={periodo.id}
                periodo={periodo}
                onUpdate={actualizarPeriodo}
                onUpdateTrimestre={actualizarTrimestre}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📅</div>
              <CardTitle className="mb-2">No hay períodos lectivos</CardTitle>
              <CardDescription className="mb-6">
                Aún no hay períodos lectivos registrados en el sistema.
                Crea el primer período para comenzar.
              </CardDescription>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Período
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreatePeriodoDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={fetchPeriodos}
      />
    </>
  );
}