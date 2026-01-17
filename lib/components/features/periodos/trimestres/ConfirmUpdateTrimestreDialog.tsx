// nextjs-frontend/lib/components/features/periodos/trimestres/ConfirmUpdateTrimestreDialog.tsx
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
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { 
  AlertTriangle, 
  Calendar, 
  Activity, 
  Info,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Lock,
  Trash2,
  RotateCcw
} from 'lucide-react';
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
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getEstadoBadge = (estado: TrimestreEstado) => {
    switch (estado) {
      case TrimestreEstado.ACTIVO:
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <PlayCircle className="h-3 w-3" />
            Activo
          </Badge>
        );
      case TrimestreEstado.FINALIZADO:
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Finalizado
          </Badge>
        );
      case TrimestreEstado.PENDIENTE:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getEstadoChangeMessage = (from: TrimestreEstado, to: TrimestreEstado) => {
    // Combinaciones no permitidas
    if (from === TrimestreEstado.PENDIENTE && to === TrimestreEstado.FINALIZADO) {
      return {
        allowed: false,
        icon: XCircle,
        color: 'red',
        title: 'Transición no permitida',
        messages: [
          'No puedes finalizar un trimestre directamente desde estado Pendiente',
          'Primero debes activar el trimestre',
        ]
      };
    }

    if (from === TrimestreEstado.FINALIZADO && to === TrimestreEstado.PENDIENTE) {
      return {
        allowed: false,
        icon: XCircle,
        color: 'red',
        title: 'Transición no permitida',
        messages: [
          'No puedes cambiar un trimestre finalizado a Pendiente',
          'Solo puedes reactivarlo (cambiar a Activo)',
        ]
      };
    }

    // Combinaciones permitidas
    if (from === TrimestreEstado.PENDIENTE && to === TrimestreEstado.ACTIVO) {
      return {
        allowed: true,
        icon: PlayCircle,
        color: 'green',
        title: 'Activar trimestre',
        messages: [
          'Los docentes podrán crear insumos y calificarlos',
          'El trimestre estará disponible para registro de notas',
        ]
      };
    }

    if (from === TrimestreEstado.ACTIVO && to === TrimestreEstado.FINALIZADO) {
      return {
        allowed: true,
        icon: Lock,
        color: 'orange',
        title: 'Finalizar trimestre',
        messages: [
          'Se cerrarán todos los insumos publicados',
          'Los docentes ya NO podrán ingresar ni modificar calificaciones',
          'Se generarán los promedios del trimestre automáticamente',
          trimestre.nombre === 'TERCER TRIMESTRE' 
            ? '⚠️ Al ser el último trimestre, también se generarán los promedios del período'
            : '',
        ].filter(Boolean)
      };
    }

    if (from === TrimestreEstado.FINALIZADO && to === TrimestreEstado.ACTIVO) {
      return {
        allowed: true,
        icon: RotateCcw,
        color: 'blue',
        title: 'Reactivar trimestre',
        messages: [
          'Se ELIMINARÁN los promedios de trimestre generados',
          trimestre.nombre === 'TERCER TRIMESTRE'
            ? 'También se eliminarán los promedios del período (si existen)'
            : '',
          'Los docentes podrán crear y modificar calificaciones nuevamente',
          'Para regenerar los promedios deberás cerrar el trimestre nuevamente',
        ].filter(Boolean)
      };
    }

    if (from === TrimestreEstado.ACTIVO && to === TrimestreEstado.PENDIENTE) {
      return {
        allowed: true,
        icon: Clock,
        color: 'yellow',
        title: 'Pausar trimestre',
        messages: [
          'Los docentes NO podrán crear ni modificar calificaciones',
          'El trimestre quedará en espera',
          'Podrás reactivarlo cuando lo necesites',
        ]
      };
    }

    return {
      allowed: true,
      icon: Info,
      color: 'blue',
      title: 'Cambio de estado',
      messages: ['Se actualizará el estado del trimestre']
    };
  };

  const fechasCambiaron = changes.fechaInicio || changes.fechaFin;
  const estadoCambio = changes.estado && changes.estado !== originalData.estado;
  const estadoInfo = estadoCambio ? getEstadoChangeMessage(originalData.estado, changes.estado!) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Cambios en fechas</span>
              </div>
              
              {changes.fechaInicio && (
                <div className="text-sm space-y-1 mb-3">
                  <p className="text-gray-600 font-medium">Fecha de inicio:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 line-through">{formatDate(originalData.fechaInicio)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 font-semibold">{formatDate(changes.fechaInicio)}</span>
                  </div>
                </div>
              )}
              
              {changes.fechaFin && (
                <div className="text-sm space-y-1">
                  <p className="text-gray-600 font-medium">Fecha de fin:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 line-through">{formatDate(originalData.fechaFin)}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-green-600 font-semibold">{formatDate(changes.fechaFin)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cambio de estado */}
          {estadoCambio && estadoInfo && (
            <>
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">Cambio de estado</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Actual:</span>
                    {getEstadoBadge(originalData.estado)}
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Nuevo:</span>
                    {getEstadoBadge(changes.estado!)}
                  </div>
                </div>
              </div>

              {/* Mensaje de acción */}
              <Alert className={`border-2 ${
                estadoInfo.color === 'red' ? 'border-red-200 bg-red-50' :
                estadoInfo.color === 'green' ? 'border-green-200 bg-green-50' :
                estadoInfo.color === 'orange' ? 'border-orange-200 bg-orange-50' :
                estadoInfo.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <estadoInfo.icon className={`h-4 w-4 ${
                  estadoInfo.color === 'red' ? 'text-red-600' :
                  estadoInfo.color === 'green' ? 'text-green-600' :
                  estadoInfo.color === 'orange' ? 'text-orange-600' :
                  estadoInfo.color === 'yellow' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <AlertDescription>
                  <p className={`font-semibold mb-2 ${
                    estadoInfo.color === 'red' ? 'text-red-900' :
                    estadoInfo.color === 'green' ? 'text-green-900' :
                    estadoInfo.color === 'orange' ? 'text-orange-900' :
                    estadoInfo.color === 'yellow' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {estadoInfo.title}
                  </p>
                  <ul className={`text-sm space-y-1 ${
                    estadoInfo.color === 'red' ? 'text-red-700' :
                    estadoInfo.color === 'green' ? 'text-green-700' :
                    estadoInfo.color === 'orange' ? 'text-orange-700' :
                    estadoInfo.color === 'yellow' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {estadoInfo.messages.map((msg, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{msg}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-2">
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!!(estadoInfo && !estadoInfo.allowed)}
            className={`flex-1 shadow-md ${
              estadoInfo && !estadoInfo.allowed
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {estadoInfo && !estadoInfo.allowed ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                No Permitido
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirmar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}