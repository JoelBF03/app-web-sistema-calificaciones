'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { AlertTriangle, Calendar, Activity } from 'lucide-react';
import { PeriodoLectivo, EstadoPeriodo } from '@/lib/types/periodo.types';

interface ConfirmUpdatePeriodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodo: PeriodoLectivo;
  changes: {
    nombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
    estado?: EstadoPeriodo;
  };
  originalData: PeriodoLectivo;
}

export default function ConfirmUpdatePeriodoDialog({
  isOpen,
  onClose,
  onConfirm,
  periodo,
  changes,
  originalData
}: ConfirmUpdatePeriodoDialogProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getEstadoBadge = (estado: EstadoPeriodo) => {
    switch (estado) {
      case EstadoPeriodo.ACTIVO:
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case EstadoPeriodo.FINALIZADO:
        return <Badge variant="secondary">Finalizado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const nombreCambio = changes.nombre && changes.nombre !== originalData.nombre;
  const fechasCambiaron = changes.fechaInicio || changes.fechaFin;
  const estadoCambio = changes.estado && changes.estado !== originalData.estado;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Actualización del Período
          </DialogTitle>
          <DialogDescription>
            Estás a punto de modificar el período <strong>"{periodo.nombre}"</strong>. 
            Revisa los cambios antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {nombreCambio && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-blue-900">Cambio de nombre:</span>
              </div>
              <div className="text-sm">
                <p><span className="text-red-600 line-through">{originalData.nombre}</span> → <span className="text-green-600 font-medium">{changes.nombre}</span></p>
              </div>
            </div>
          )}

          {fechasCambiaron && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Cambios en fechas:</span>
              </div>
              
              {changes.fechaInicio && (
                <div className="text-sm space-y-1">
                  <p className="text-gray-600">Fecha de inicio:</p>
                  <p><span className="text-red-600 line-through">{formatDate(originalData.fechaInicio)}</span> → <span className="text-green-600 font-medium">{formatDate(changes.fechaInicio)}</span></p>
                </div>
              )}
              
              {changes.fechaFin && (
                <div className="text-sm space-y-1 mt-2">
                  <p className="text-gray-600">Fecha de fin:</p>
                  <p><span className="text-red-600 line-through">{formatDate(originalData.fechaFin)}</span> → <span className="text-green-600 font-medium">{formatDate(changes.fechaFin)}</span></p>
                </div>
              )}
            </div>
          )}

          {estadoCambio && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Cambio de estado:</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {getEstadoBadge(originalData.estado)}
                <span>→</span>
                {getEstadoBadge(changes.estado!)}
              </div>
            </div>
          )}

          {fechasCambiaron && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Advertencia:</strong> Los cambios en las fechas del período se validarán contra las fechas de los trimestres existentes.
              </p>
            </div>
          )}

          {estadoCambio && changes.estado === EstadoPeriodo.FINALIZADO && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                🚫 <strong>Finalización:</strong> Solo se permite si todos los trimestres están finalizados.
              </p>
            </div>
          )}

          {estadoCambio && changes.estado === EstadoPeriodo.ACTIVO && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                🔄 <strong>Activación:</strong> Solo se permite si no hay otro período activo.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-amber-600 hover:bg-amber-700">
            Confirmar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}