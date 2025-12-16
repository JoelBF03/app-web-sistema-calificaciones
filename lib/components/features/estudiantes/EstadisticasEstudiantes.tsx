import { EstadisticasEstudiantes as EstadisticasType } from '@/lib/types/estudiante.types';
import { CheckCircle, AlertTriangle, GraduationCap, UserMinus } from 'lucide-react';
import { Card } from '@/lib/components/ui/card';

interface EstadisticasEstudiantesProps {
  estadisticas: EstadisticasType;
}

export function EstadisticasEstudiantes({ estadisticas }: EstadisticasEstudiantesProps) {
  const cards = [
    {
      titulo: 'ESTUDIANTES ACTIVOS',
      valor: estadisticas?.activos ?? 0,
      icon: CheckCircle,
      colorBorde: 'border-purple-500',
      colorIcono: 'text-purple-500'
    },
      {
      titulo: 'SIN MATRÍCULA',
      valor: estadisticas?.sinMatricula ?? 0,
      icon: AlertTriangle,
      colorBorde: 'border-orange-500',
      colorIcono: 'text-orange-500'
    },    
    {
      titulo: 'DATOS COMPLETOS',
      valor: estadisticas?.completos ?? 0,
      icon: CheckCircle,
      colorBorde: 'border-green-500',
      colorIcono: 'text-green-500'
    },
    {
      titulo: 'DATOS INCOMPLETOS',
      valor: estadisticas?.incompletos ?? 0,
      icon: AlertTriangle,
      colorBorde: 'border-yellow-500',
      colorIcono: 'text-yellow-500'
    },
    {
      titulo: 'GRADUADOS',
      valor: estadisticas?.graduados ?? 0,
      icon: GraduationCap,
      colorBorde: 'border-blue-500',
      colorIcono: 'text-blue-500'
    },
    {
      titulo: 'RETIRADOS',
      valor: estadisticas?.retirados ?? 0,
      icon: UserMinus,
      colorBorde: 'border-red-500',
      colorIcono: 'text-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={`p-6 border-l-4 ${card.colorBorde}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{card.titulo}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {card.valor.toLocaleString()}
                </p>
              </div>
              <Icon className={`w-10 h-10 ${card.colorIcono}`} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}