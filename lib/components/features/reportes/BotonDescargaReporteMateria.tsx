'use client';

import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { useReportes } from '@/lib/hooks/useReportes';

interface BotonDescargaReporteMateriaProps {
  materia_curso_id: string;
  materia_nombre: string;
  trimestre_id: string;
  trimestre_nombre: string;
  disabled?: boolean;
}

export const BotonDescargaReporteMateria = ({
  materia_curso_id,
  materia_nombre,
  trimestre_id,
  trimestre_nombre,
  disabled = false,
}: BotonDescargaReporteMateriaProps) => {
  const { descargando, descargarReporteMateria } = useReportes();

  const handleDescargar = () => {
    descargarReporteMateria(materia_curso_id, materia_nombre, trimestre_id, trimestre_nombre);
  };

  return (
    <Button
      onClick={handleDescargar}
      disabled={descargando || disabled}
      variant="outline"
      className="border-2 border-green-600 text-green-600 hover:bg-green-50"
    >
      {descargando ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Reporte General de Materia
        </>
      )}
    </Button>
  );
};