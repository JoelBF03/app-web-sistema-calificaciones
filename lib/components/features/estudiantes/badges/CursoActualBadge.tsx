// nextjs-frontend/lib/components/features/estudiantes/badges/CursoActualBadge.tsx

import { EspecialidadCurso, EstadoMatricula } from '@/lib/types';
import { Estudiante, EstadoEstudiante } from '@/lib/types/estudiante.types';
import { GraduationCap, PauseCircle, UserX } from 'lucide-react';

interface CursoActualBadgeProps {
  estudiante: Estudiante;
}

export function CursoActualBadge({ estudiante }: CursoActualBadgeProps) {

  if (estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
        <PauseCircle className="w-3 h-3" />
        Inactivo Temporal
      </span>
    );
  }

  // Si está retirado
  if (estudiante.estado === EstadoEstudiante.RETIRADO) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
        <UserX className="w-3 h-3" />
        Retirado
      </span>
    );
  }

  // Si está graduado
  if (estudiante.estado === EstadoEstudiante.GRADUADO) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
        <GraduationCap className="w-3 h-3" />
        Graduado
      </span>
    );
  }

  // Si está activo, buscar matrícula activa
  const matriculaActiva = estudiante.matriculas?.find(m => m.estado === EstadoMatricula.ACTIVO);

  if (matriculaActiva && matriculaActiva.curso) {
    const { nivel, paralelo, especialidad } = matriculaActiva.curso;
    const cursoTexto = especialidad && especialidad !== EspecialidadCurso.BASICA
      ? `${nivel} "${paralelo}" - ${especialidad}`
      : `${nivel} "${paralelo}"`;

    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 max-w-[200px]" title={cursoTexto}>
        <span className="truncate">{cursoTexto}</span>
      </span>
    );
  }

  // Sin matrícula activa
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">
      Sin matrícula
    </span>
  );
}