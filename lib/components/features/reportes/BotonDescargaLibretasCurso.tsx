'use client';

import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { useReportes } from '@/lib/hooks/useReportes';

interface BotonDescargaLibretasCursoProps {
  curso_id: string;/*  */
  curso_nombre: string;
  trimestre_id: string;
  trimestre_nombre: string;
  totalEstudiantes: number;
  disabled?: boolean;
}

export const BotonDescargaLibretasCurso = ({
  curso_id,
  curso_nombre,
  trimestre_id,
  trimestre_nombre,
  totalEstudiantes,
  disabled = false,
}: BotonDescargaLibretasCursoProps) => {
  const { descargando, descargarLibretasCurso } = useReportes();

  const handleDescargar = () => {
    descargarLibretasCurso(curso_id, curso_nombre, trimestre_id, trimestre_nombre);
  };

  return (
    <Button
      onClick={handleDescargar}
      disabled={descargando || disabled || totalEstudiantes === 0}
      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {descargando ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando PDF...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Descargar Libretas del Curso ({totalEstudiantes})
        </>
      )}
    </Button>
  );
};