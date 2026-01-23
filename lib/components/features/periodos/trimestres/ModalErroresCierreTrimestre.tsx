'use client';

import { AlertTriangle, X, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { ScrollArea } from '@/lib/components/ui/scroll-area';

interface ResumenDocente {
  docente_id: string;
  docente_nombre: string;
  total_problemas: number;
  problemas: string[];
}

interface ErroresCierreTrimestreProps {
  open: boolean;
  onClose: () => void;
  mensaje: string;
  resumenDocentes: ResumenDocente[];
  estadisticas?: {
    total_estudiantes: number;
    estudiantes_completos: number;
    estudiantes_incompletos: number;
    porcentaje_completado: string;
  };
}

export function ModalErroresCierreTrimestre({
  open,
  onClose,
  mensaje,
  resumenDocentes,
  estadisticas
}: ErroresCierreTrimestreProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                No se puede cerrar el trimestre
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                {mensaje}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Estadísticas */}
            {estadisticas && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Resumen General</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Total estudiantes:</p>
                    <p className="font-semibold text-gray-900">{estadisticas.total_estudiantes}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estudiantes completos:</p>
                    <p className="font-semibold text-green-600">{estadisticas.estudiantes_completos}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Estudiantes incompletos:</p>
                    <p className="font-semibold text-red-600">{estadisticas.estudiantes_incompletos}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Progreso:</p>
                    <p className="font-semibold text-blue-600">{estadisticas.porcentaje_completado}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Problemas por docente */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Docentes con calificaciones pendientes ({resumenDocentes.length})
              </h4>

              {resumenDocentes.map((docente) => (
                <div
                  key={docente.docente_id}
                  className="border border-orange-200 bg-orange-50/50 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-full mt-0.5">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        {docente.docente_nombre}
                        <span className="ml-2 text-sm font-normal text-orange-600">
                          ({docente.total_problemas} problema{docente.total_problemas !== 1 ? 's' : ''})
                        </span>
                      </h5>
                      <ul className="space-y-1.5">
                        {docente.problemas.map((problema, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>{problema}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}