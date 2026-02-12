'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowLeft, Loader2, AlertCircle, RefreshCw, User, Power } from 'lucide-react';

import { useDocentes } from '@/lib/hooks/useDocentes';
import { useUsuarios } from '@/lib/hooks/useUsuarios';
import { NivelAsignado } from '@/lib/types/docente.types';
import { Role, Estado } from '@/lib/types/usuario.types';

import DocenteCard from '@/lib/components/features/docentes/DocenteCard';
import CreateDocenteModal from '@/lib/components/features/docentes/CreateDocenteModal';
import DocenteDetailsModal from '@/lib/components/features/docentes/DocenteDetailsModal';
import DocenteEditModal from '@/lib/components/features/docentes/DocenteEditModal';
import DocentesFilters from '@/lib/components/features/docentes/DocentesFilters';
import EmptyState from '@/lib/components/features/docentes/EmptyState';
import { Card, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { toast } from 'sonner';

export default function DocentesPage() {
  const { docentes, loading, error, fetchDocentes } = useDocentes();
  const { cambiarEstado } = useUsuarios();

  const [searchTerm, setSearchTerm] = useState('');
  const [nivelFilter, setNivelFilter] = useState<'TODOS' | NivelAsignado>('TODOS');
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [rolFilter, setRolFilter] = useState<'TODOS' | Role>('TODOS');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmToggle, setShowConfirmToggle] = useState(false);
  const [selectedDocenteId, setSelectedDocenteId] = useState<string | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  const handleViewDetails = (docenteId: string) => {
    setSelectedDocenteId(docenteId);
    setShowDetailsModal(true);
  };

  const handleEdit = (docenteId: string) => {
    setSelectedDocenteId(docenteId);
    setShowEditModal(true);
  };

  const handleToggleStatus = (docenteId: string) => {
    setSelectedDocenteId(docenteId);
    setShowConfirmToggle(true);
  };

  const confirmToggleStatus = async () => {
    if (!selectedDocenteId) return;

    const docente = docentes.find(d => d.id === selectedDocenteId);
    if (!docente) return;

    setTogglingStatus(true);

    try {
      await cambiarEstado(docente.usuario_id.id);
      await fetchDocentes();
      setShowConfirmToggle(false);
      setSelectedDocenteId(null);
      toast.success('Estado actualizado correctamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado');
    } finally {
      setTogglingStatus(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setNivelFilter('TODOS');
    setEstadoFilter('TODOS');
    setRolFilter('TODOS');
  };

  const handleSuccess = async () => {
    await fetchDocentes();
    setShowEditModal(false);
  };

  const filteredDocentes = docentes.filter(docente => {
    const matchesSearch =
      docente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.usuario_id.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (docente.cedula && docente.cedula.includes(searchTerm));

    const matchesNivel = nivelFilter === 'TODOS' || docente.nivelAsignado === nivelFilter;
    const matchesEstado =
      estadoFilter === 'TODOS' ||
      (estadoFilter === 'ACTIVO' && docente.usuario_id.estado === Estado.ACTIVO) ||
      (estadoFilter === 'INACTIVO' && docente.usuario_id.estado === Estado.INACTIVO);

    const matchesRol = rolFilter === 'TODOS' || docente.usuario_id.rol === rolFilter;

    return matchesSearch && matchesNivel && matchesEstado && matchesRol;
  });

  const hasActiveFilters =
    searchTerm || nivelFilter !== 'TODOS' || estadoFilter !== 'TODOS' || rolFilter !== 'TODOS';

  const selectedDocente = docentes.find(d => d.id === selectedDocenteId);
  const isActive = selectedDocente?.usuario_id?.estado === Estado.ACTIVO;

  if (loading && docentes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-blue-600 font-medium">Cargando docentes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={fetchDocentes}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <User className="w-7 h-7 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Gestión de Docentes</CardTitle>
                <CardDescription>Administra el catálogo de docentes</CardDescription>
              </div>
            </div>

            <Button className="cursor-pointer" onClick={() => setShowCreateModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Docente
            </Button>
          </CardHeader>
        </Card>

        <DocentesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          nivelFilter={nivelFilter}
          setNivelFilter={setNivelFilter}
          estadoFilter={estadoFilter}
          setEstadoFilter={setEstadoFilter}
          rolFilter={rolFilter}
          setRolFilter={setRolFilter}
          onClearFilters={clearFilters}
        />

        {filteredDocentes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocentes.map(docente => (
              <DocenteCard
                key={docente.id}
                docente={docente}
                onViewDetails={handleViewDetails}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <EmptyState hasFilters={!!hasActiveFilters} onCreateNew={() => setShowCreateModal(true)} />
        )}
      </div>

      <CreateDocenteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchDocentes}
      />

      <DocenteDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDocenteId(null);
        }}
        docenteId={selectedDocenteId}
      />

      <DocenteEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDocenteId(null);
        }}
        docenteId={selectedDocenteId}
        onSuccess={handleSuccess}
      />

      <Dialog open={showConfirmToggle} onOpenChange={setShowConfirmToggle}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Power className="w-5 h-5 text-yellow-600" />
              Confirmar cambio de estado
            </DialogTitle>
            <DialogDescription>
              ¿Seguro que deseas {isActive ? 'desactivar' : 'activar'} al docente{' '}
              <span className="font-medium">
                {selectedDocente?.nombres} {selectedDocente?.apellidos}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowConfirmToggle(false)} disabled={togglingStatus}>
              Cancelar
            </Button>
            <Button
              onClick={confirmToggleStatus}
              disabled={togglingStatus}
              variant={isActive ? "destructive" : "default"}
            >
              {togglingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                isActive ? 'Desactivar' : 'Activar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}