// nextjs-frontend/lib/components/features/estudiantes/badges/EstadoBadge.tsx

import { EstadoEstudiante } from '@/lib/types/estudiante.types';

interface EstadoBadgeProps {
  estado: EstadoEstudiante;
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const configs = {
    [EstadoEstudiante.ACTIVO]: {
      color: 'bg-green-500',
      title: 'Activo'
    },
    [EstadoEstudiante.SIN_MATRICULA]: {
      color: 'bg-yellow-500',
      title: 'Sin matrícula'
    },
    [EstadoEstudiante.GRADUADO]: {
      color: 'bg-blue-500',
      title: 'Graduado'
    },
    [EstadoEstudiante.RETIRADO]: {
      color: 'bg-red-500',
      title: 'Retirado'
    }
  };

  const config = configs[estado];

  return (
    <div className="flex items-center justify-center" title={config.title}>
      <div className={`w-3 h-3 ${config.color} rounded-full`} />
    </div>
  );
}