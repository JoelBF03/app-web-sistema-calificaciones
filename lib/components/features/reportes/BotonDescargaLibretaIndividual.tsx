// nextjs-frontend/lib/components/features/reportes/BotonDescargaLibretaIndividual.tsx
'use client';

import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/lib/components/ui/tooltip';
import { useReportes } from '@/lib/hooks/useReportes';

interface BotonDescargaLibretaIndividualProps {
  estudiante_id: string;
  estudiante_nombre: string;
  trimestre_id: string;
  disabled?: boolean;
}

export const BotonDescargaLibretaIndividual = ({
  estudiante_id,
  estudiante_nombre,
  trimestre_id,
  disabled = false,
}: BotonDescargaLibretaIndividualProps) => {
  const { descargando, descargarLibretaIndividual } = useReportes();

  const handleDescargar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se propague el click
    descargarLibretaIndividual(estudiante_id, estudiante_nombre, trimestre_id);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleDescargar}
            disabled={descargando || disabled}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
          >
            {descargando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Descargar libreta de {estudiante_nombre}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};