'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Info } from 'lucide-react';

export function EscalaCalificaciones() {
  const escalas = [
    { cualitativa: 'DA', descripcion: 'Domina los aprendizajes', rango: '9.00 - 10.00', color: 'bg-green-100 text-green-800 border-green-300' },
    { cualitativa: 'AA', descripcion: 'Alcanza los aprendizajes', rango: '7.00 - 8.99', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { cualitativa: 'PA', descripcion: 'Próximo a alcanzar los aprendizajes', rango: '4.01 - 6.99', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { cualitativa: 'NA', descripcion: 'No alcanza los aprendizajes', rango: '<= 4', color: 'bg-red-100 text-red-800 border-red-300' },
  ];

  return (
    <Card className="border-2 border-gray-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200 py-3">
        <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
          <Info className="h-4 w-4" />
          ESCALA DE CALIFICACIONES
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1.5">
          {escalas.map((escala) => (
            <div key={escala.cualitativa} className="flex items-center justify-between py-1.5 border-b border-gray-200 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${escala.color}`}>
                  {escala.cualitativa}
                </span>
                <span className="text-xs font-medium text-gray-700">{escala.descripcion}</span>
              </div>
              <span className="text-xs font-semibold text-gray-600">{escala.rango}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}