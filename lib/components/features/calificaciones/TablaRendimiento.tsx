'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { PromedioTrimestre, EstadisticasRendimiento, CalificacionCualitativa } from '@/lib/types/calificaciones.types';

interface TablaRendimientoProps {
  promedios: PromedioTrimestre[];
  nombreTrimestre: string;
}

export function TablaRendimiento({ promedios, nombreTrimestre }: TablaRendimientoProps) {
  const estadisticas: EstadisticasRendimiento = useMemo(() => {
    const total = promedios.length;
    const DA = promedios.filter(p => p.cualitativa === CalificacionCualitativa.DA).length;
    const AA = promedios.filter(p => p.cualitativa === CalificacionCualitativa.AA).length;
    const PA = promedios.filter(p => p.cualitativa === CalificacionCualitativa.PA).length;
    const NA = promedios.filter(p => p.cualitativa === CalificacionCualitativa.NA).length;

    return {
      total_estudiantes: total,
      DA,
      AA,
      PA,
      NA,
      porcentaje_DA: total > 0 ? (DA / total) * 100 : 0,
      porcentaje_AA: total > 0 ? (AA / total) * 100 : 0,
      porcentaje_PA: total > 0 ? (PA / total) * 100 : 0,
      porcentaje_NA: total > 0 ? (NA / total) * 100 : 0,
    };
  }, [promedios]);

  const items = [
    { cualitativa: 'DA', label: 'Domina los aprendizajes', count: estadisticas.DA, porcentaje: estadisticas.porcentaje_DA, color: 'bg-green-600' },
    { cualitativa: 'AA', label: 'Alcanza los aprendizajes', count: estadisticas.AA, porcentaje: estadisticas.porcentaje_AA, color: 'bg-blue-600' },
    { cualitativa: 'PA', label: 'Está próximo a alcanzar', count: estadisticas.PA, porcentaje: estadisticas.porcentaje_PA, color: 'bg-yellow-600' },
    { cualitativa: 'NA', label: 'No alcanza los aprendizajes', count: estadisticas.NA, porcentaje: estadisticas.porcentaje_NA, color: 'bg-red-600' },
  ];

  if (promedios.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-gray-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200 py-3">
        <CardTitle className="flex items-center gap-2 text-purple-900 text-sm">
          <BarChart3 className="h-4 w-4" />
          % RENDIMIENTO {nombreTrimestre.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.cualitativa} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">
                  ({item.cualitativa}) {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{item.count}</span>
                  <span className="font-bold text-gray-600 w-14 text-right">{item.porcentaje.toFixed(2)}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full ${item.color} flex items-center justify-end px-2 transition-all duration-500`}
                  style={{ width: `${item.porcentaje}%` }}
                >
                  {item.porcentaje > 10 && (
                    <span className="text-[10px] font-bold text-white">{item.porcentaje.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t-2 border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">TOTAL ESTUDIANTES:</span>
            <span className="text-lg font-bold text-red-600">{estadisticas.total_estudiantes}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}