// nextjs-frontend/lib/components/features/estudiantes/ModalRetirarEstudiante.tsx

import { useState } from 'react';
import { Estudiante } from '@/lib/types/estudiante.types';
import { X, UserX, AlertTriangle } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card } from '@/lib/components/ui/card';
import { Label } from '@/lib/components/ui/label';
import { Textarea } from '@/lib/components/ui/textarea';

interface ModalRetirarEstudianteProps {
  estudiante: Estudiante;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, motivo?: string) => Promise<void>;
}

export function ModalRetirarEstudiante({
  estudiante,
  isOpen,
  onClose,
  onConfirm,
}: ModalRetirarEstudianteProps) {
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(estudiante.id, motivo.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error al retirar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Retirar Estudiante
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-red-800"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Advertencia */}
          <Card className="p-4 bg-red-50 border-red-300">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-semibold text-red-900">
                  ¿Está seguro de retirar este estudiante?
                </h3>
                <p className="text-sm text-red-700">
                  Esta acción cambiará el estado del estudiante a "RETIRADO". El estudiante
                  dejará de estar activo en el sistema, pero podrá ser reactivado posteriormente
                  si es necesario.
                </p>
              </div>
            </div>
          </Card>

          {/* Información del estudiante */}
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Estudiante:</span>
                <p className="font-bold text-gray-900 text-lg">
                  {estudiante.nombres_completos}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Cédula:</span>
                <p className="font-semibold text-gray-900">
                  {estudiante.estudiante_cedula}
                </p>
              </div>
            </div>
          </Card>

          {/* Motivo del retiro */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del retiro (opcional)</Label>
            <Textarea
              id="motivo"
              placeholder="Escriba el motivo del retiro del estudiante..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Este motivo quedará registrado en el sistema para referencia futura.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              <UserX className="w-4 h-4 mr-2" />
              {loading ? 'Retirando...' : 'Confirmar Retiro'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}