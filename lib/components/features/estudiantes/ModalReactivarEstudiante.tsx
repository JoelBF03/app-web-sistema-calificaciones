// nextjs-frontend/lib/components/features/estudiantes/ModalReactivarEstudiante.tsx

import { useState } from 'react';
import { Estudiante } from '@/lib/types/estudiante.types';
import { X, Undo, CheckCircle } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card } from '@/lib/components/ui/card';

interface ModalReactivarEstudianteProps {
  estudiante: Estudiante;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function ModalReactivarEstudiante({
  estudiante,
  isOpen,  
  onClose,
  onConfirm,
}: ModalReactivarEstudianteProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(estudiante.id);
      onClose();
    } catch (error) {
      console.error('Error al reactivar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Undo className="w-5 h-5" />
            Reactivar Estudiante
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-orange-800"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información */}
          <Card className="p-4 bg-green-50 border-green-300">
            <div className="flex gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-semibold text-green-900">
                  ¿Desea reactivar este estudiante?
                </h3>
                <p className="text-sm text-green-700">
                  Al reactivar, el estudiante volverá al estado "ACTIVO" y podrá ser matriculado
                  nuevamente en períodos lectivos.
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
              <div>
                <span className="text-sm text-gray-600">Estado actual:</span>
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                  RETIRADO
                </span>
              </div>
            </div>
          </Card>

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
              onClick={handleConfirm}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Undo className="w-4 h-4 mr-2" />
              {loading ? 'Reactivando...' : 'Confirmar Reactivación'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}