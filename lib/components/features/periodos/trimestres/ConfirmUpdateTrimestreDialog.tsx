// app/lib/components/admin/ConfirmUpdateTrimestreDialog.tsx
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
import { Trimestre, TrimestreEstado } from '@/lib/types/periodo.types';

interface ConfirmUpdateTrimestreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trimestre: Trimestre;
  changes: {
    fechaInicio?: string;
    fechaFin?: string;
    estado?: TrimestreEstado;
  };
  originalData: Trimestre;
}

export default function ConfirmUpdateTrimestreDialog({
  isOpen,
  onClose,
  onConfirm,
  trimestre,
  changes,
  originalData
}: ConfirmUpdateTrimestreDialogProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getEstadoBadge = (estado: TrimestreEstado) => {
    switch (estado) {
      case TrimestreEstado.ACTIVO:
        return <Badge className="bg-green-100 text-green-800">🟢 Activo</Badge>;
      case TrimestreEstado.FINALIZADO:
        return <Badge variant="secondary">✅ Finalizado</Badge>;
      case TrimestreEstado.PENDIENTE:
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendiente</Badge>;
      default:
        return <Badge variant="outline">❓ Desconocido</Badge>;
    }
  };

  const fechasCambiaron = changes.fechaInicio || changes.fechaFin;
  const estadoCambio = changes.estado && changes.estado !== originalData.estado;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Actualización
          </DialogTitle>
          <DialogDescription>
            Estás a punto de modificar el <strong>{trimestre.nombre}</strong>. 
            Revisa los cambios antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cambios en fechas */}
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

          {/* Cambios en estado */}
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

          {/* Advertencias especiales */}
          {estadoCambio && changes.estado === TrimestreEstado.ACTIVO && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Advertencia:</strong> Al activar este trimestre, cualquier otro trimestre activo del mismo período será finalizado automáticamente.
              </p>
            </div>
          )}

          {originalData.estado === TrimestreEstado.FINALIZADO && estadoCambio && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                🔄 <strong>Reactivación:</strong> Solo se permite si el período lectivo está activo.
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