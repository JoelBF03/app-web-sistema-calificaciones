'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Badge } from '@/lib/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2,
  BookCheck,
  Lock,
  RotateCcw,
  Clock,
  TrendingUp,
  Users,
  XCircle,
  Info
} from 'lucide-react';
import { PeriodoLectivo, EstadoSupletorio } from '@/lib/types/periodo.types';

interface ConfirmUpdateSupletoriosDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodo: PeriodoLectivo;
  nuevoEstado: EstadoSupletorio;
}

export default function ConfirmUpdateSupletoriosDialog({
  isOpen,
  onClose,
  onConfirm,
  periodo,
  nuevoEstado
}: ConfirmUpdateSupletoriosDialogProps) {

  const estadoActual = periodo.estado_supletorio;

  const getEstadoBadge = (estado: EstadoSupletorio) => {
    switch (estado) {
      case EstadoSupletorio.PENDIENTE:
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      case EstadoSupletorio.ACTIVADO:
        return (
          <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <BookCheck className="h-3 w-3" />
            Activado
          </Badge>
        );
      case EstadoSupletorio.CERRADO:
        return (
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Cerrado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getTransicionInfo = (from: EstadoSupletorio, to: EstadoSupletorio) => {
    // ❌ TRANSICIONES NO PERMITIDAS
    if (from === EstadoSupletorio.CERRADO && to === EstadoSupletorio.PENDIENTE) {
      return {
        allowed: false,
        icon: XCircle,
        color: 'red',
        title: 'Transición no permitida',
        messages: [
          'No puedes regresar de CERRADO a PENDIENTE directamente',
          'Primero debes reabrir los supletorios (cambiar a ACTIVADO)',
        ]
      };
    }

    if (from === EstadoSupletorio.PENDIENTE && to === EstadoSupletorio.CERRADO) {
      return {
        allowed: false,
        icon: XCircle,
        color: 'red',
        title: 'Transición no permitida',
        messages: [
          'No puedes cerrar supletorios que aún están PENDIENTES',
          'Primero debes activarlos (cambiar a ACTIVADO)',
        ]
      };
    }

    // ✅ TRANSICIONES PERMITIDAS

    // PENDIENTE → ACTIVADO
    if (from === EstadoSupletorio.PENDIENTE && to === EstadoSupletorio.ACTIVADO) {
      return {
        allowed: true,
        icon: BookCheck,
        color: 'orange',
        title: 'Activar Período de Supletorios',
        messages: [
          'Se analizarán todos los promedios anuales del período',
          'Los estudiantes con promedio entre 5.00 y 6.99 quedarán habilitados',
          'Los docentes podrán ingresar calificaciones de supletorios',
          'Regla: Promedio Final = (Promedio Anual + Nota Supletorio) / 2',
          'Si el resultado es ≥ 7.00, se registrará como 7.00 (tope máximo)',
        ]
      };
    }

    // ACTIVADO → CERRADO
    if (from === EstadoSupletorio.ACTIVADO && to === EstadoSupletorio.CERRADO) {
      return {
        allowed: true,
        icon: Lock,
        color: 'amber',
        title: 'Cerrar Período de Supletorios',
        messages: [
          'Las calificaciones de supletorio quedarán bloqueadas para edición directa',
          'Los docentes NO podrán ingresar ni modificar calificaciones desde la tabla',
          'Se podrán corregir notas mediante el modal de detalle (como en proyectos)',
          'Los estudiantes que no rindieron supletorio quedarán con estado REPROBADO',
          'Después de cerrar, podrás FINALIZAR el período lectivo',
        ]
      };
    }

    // ACTIVADO → PENDIENTE
    if (from === EstadoSupletorio.ACTIVADO && to === EstadoSupletorio.PENDIENTE) {
      return {
        allowed: true,
        icon: RotateCcw,
        color: 'blue',
        title: 'Regresar Supletorios a Pendiente',
        messages: [
          'Los supletorios volverán a estado PENDIENTE',
          'Las calificaciones de supletorio ya registradas se mantendrán',
          'Los docentes NO podrán calificar hasta que reactives los supletorios',
          'Útil si activaste supletorios por error',
        ]
      };
    }

    // CERRADO → ACTIVADO
    if (from === EstadoSupletorio.CERRADO && to === EstadoSupletorio.ACTIVADO) {
      return {
        allowed: true,
        icon: RotateCcw,
        color: 'orange',
        title: 'Reabrir Supletorios',
        messages: [
          'El período de supletorios se reabrirá para edición',
          'Los docentes podrán ingresar y modificar calificaciones nuevamente',
          'Las calificaciones ya registradas se mantendrán',
          'Útil para corregir errores o agregar notas faltantes',
          'Podrás volver a cerrarlos cuando termines',
        ]
      };
    }

    // Default
    return {
      allowed: true,
      icon: Info,
      color: 'blue',
      title: 'Cambio de Estado',
      messages: ['Se actualizará el estado de supletorios']
    };
  };

  const transicionInfo = getTransicionInfo(estadoActual, nuevoEstado);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-700">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Cambio de Estado de Supletorios
          </DialogTitle>
          <DialogDescription>
            Período: <strong>"{periodo.nombre}"</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cambio de estado */}
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-900">Cambio de Estado</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Actual:</span>
                {getEstadoBadge(estadoActual)}
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Nuevo:</span>
                {getEstadoBadge(nuevoEstado)}
              </div>
            </div>
          </div>

          {/* Mensaje de acción */}
          <Alert className={`border-2 ${
            transicionInfo.color === 'red' ? 'border-red-200 bg-red-50' :
            transicionInfo.color === 'orange' ? 'border-orange-200 bg-orange-50' :
            transicionInfo.color === 'amber' ? 'border-amber-200 bg-amber-50' :
            transicionInfo.color === 'blue' ? 'border-blue-200 bg-blue-50' :
            'border-gray-200 bg-gray-50'
          }`}>
            <transicionInfo.icon className={`h-4 w-4 ${
              transicionInfo.color === 'red' ? 'text-red-600' :
              transicionInfo.color === 'orange' ? 'text-orange-600' :
              transicionInfo.color === 'amber' ? 'text-amber-600' :
              transicionInfo.color === 'blue' ? 'text-blue-600' :
              'text-gray-600'
            }`} />
            <AlertDescription>
              <p className={`font-semibold mb-2 ${
                transicionInfo.color === 'red' ? 'text-red-900' :
                transicionInfo.color === 'orange' ? 'text-orange-900' :
                transicionInfo.color === 'amber' ? 'text-amber-900' :
                transicionInfo.color === 'blue' ? 'text-blue-900' :
                'text-gray-900'
              }`}>
                {transicionInfo.title}
              </p>
              <ul className={`text-sm space-y-1 ${
                transicionInfo.color === 'red' ? 'text-red-700' :
                transicionInfo.color === 'orange' ? 'text-orange-700' :
                transicionInfo.color === 'amber' ? 'text-amber-700' :
                transicionInfo.color === 'blue' ? 'text-blue-700' :
                'text-gray-700'
              }`}>
                {transicionInfo.messages.map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Advertencias adicionales según transición */}
          {nuevoEstado === EstadoSupletorio.ACTIVADO && estadoActual === EstadoSupletorio.PENDIENTE && (
            <Alert className="border-2 border-green-200 bg-green-50">
              <Users className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <p className="text-sm text-green-700">
                  💡 <strong>Tip:</strong> Después de activar, podrás ver estadísticas detalladas de cuántos estudiantes
                  necesitan rendir supletorio por materia y curso.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {nuevoEstado === EstadoSupletorio.CERRADO && (
            <Alert className="border-2 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Una vez cerrados, solo podrás editar calificaciones mediante
                  el modal de detalle. Puedes reabrir si necesitas hacer cambios masivos.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 border-2">
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={!transicionInfo.allowed}
            className={`flex-1 shadow-md ${
              !transicionInfo.allowed
                ? 'bg-gray-400 cursor-not-allowed'
                : transicionInfo.color === 'orange'
                ? 'bg-orange-600 hover:bg-orange-700'
                : transicionInfo.color === 'amber'
                ? 'bg-amber-600 hover:bg-amber-700'
                : transicionInfo.color === 'blue'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {!transicionInfo.allowed ? (
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