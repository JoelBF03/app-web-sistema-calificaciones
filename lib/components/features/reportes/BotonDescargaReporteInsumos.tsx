/* 'use client';

import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { useReportes } from '@/lib/hooks/useReportes';

interface BotonDescargaReporteInsumosProps {
  materia_curso_id: string;
  materia_nombre: string;
  trimestre_id: string;
  trimestre_nombre: string;
  disabled?: boolean;
}

export const BotonDescargaReporteInsumos = ({
  materia_curso_id,
  materia_nombre,
  trimestre_id,
  trimestre_nombre,
  disabled = false,
}: BotonDescargaReporteInsumosProps) => {
  const { descargando, descargarReporteInsumos } = useReportes();

  const handleDescargar = () => {
    descargarReporteInsumos(materia_curso_id, materia_nombre, trimestre_id, trimestre_nombre);
  };

  return (
    <Button
      onClick={handleDescargar}
      disabled={descargando || disabled}
      variant="outline"
      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
    >
      {descargando ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Reporte de Insumos
        </>
      )}
    </Button>
  );
}; */