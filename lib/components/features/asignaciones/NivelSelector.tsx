// lib/components/features/asignaciones/NivelSelector.tsx
'use client';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { NivelCurso, EspecialidadCurso } from '@/lib/types/curso.types';

interface NivelSelectorProps {
  nivelSeleccionado: {
    nivel: NivelCurso;
    especialidad?: EspecialidadCurso;
  };
  onNivelChange: (nivel: NivelCurso, especialidad?: EspecialidadCurso) => void;
}

const todosLosNiveles = [
  { nivel: NivelCurso.OCTAVO, label: '8vo', color: 'purple' },
  { nivel: NivelCurso.NOVENO, label: '9no', color: 'purple' },
  { nivel: NivelCurso.DECIMO, label: '10mo', color: 'purple' },
  { nivel: NivelCurso.PRIMERO_BACHILLERATO, label: '1ro Bachillerato', color: 'blue' },
  { nivel: NivelCurso.SEGUNDO_BACHILLERATO, label: '2do Bachillerato', color: 'blue' },
  { nivel: NivelCurso.TERCERO_BACHILLERATO, label: '3ro Bachillerato', color: 'blue' },
];

export function NivelSelector({ nivelSeleccionado, onNivelChange }: NivelSelectorProps) {
  const esBachillerato = [
    NivelCurso.PRIMERO_BACHILLERATO,
    NivelCurso.SEGUNDO_BACHILLERATO,
    NivelCurso.TERCERO_BACHILLERATO
  ].includes(nivelSeleccionado.nivel);

  const especialidadActual = nivelSeleccionado.especialidad || EspecialidadCurso.TECNICO;
  return (
    <Card className="bg-gray-50 border-2">
      <CardContent className="p-6 space-y-4">
        {/* Primera fila: Todos los niveles */}
        <div className="flex flex-wrap gap-3">
          {todosLosNiveles.map(({ nivel, label, color }) => {
            const isBasica = color === 'purple';
            const isSelected = nivelSeleccionado.nivel === nivel;
            
            return (
              <Button
                key={nivel}
                size="lg"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => {
                  if (isBasica) {
                    onNivelChange(nivel);
                  } else {
                    onNivelChange(nivel, especialidadActual);
                  }
                }}
                className={
                  isSelected
                    ? isBasica
                      ? 'bg-purple-600 hover:bg-purple-700 font-semibold'
                      : especialidadActual === EspecialidadCurso.TECNICO
                      ? 'bg-orange-600 hover:bg-orange-700 font-semibold'
                      : 'bg-green-600 hover:bg-green-700 font-semibold'
                    : 'font-semibold'
                }
              >
                {label}
              </Button>
            );
          })}
        </div>

        {/* Segunda fila: Especialidades de Bachillerato (solo si está en bachillerato) */}
        {esBachillerato && (
          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <Button
              size="lg"
              variant={especialidadActual === EspecialidadCurso.TECNICO ? 'default' : 'outline'}
              onClick={() => onNivelChange(nivelSeleccionado.nivel, EspecialidadCurso.TECNICO)}
              className={
                especialidadActual === EspecialidadCurso.TECNICO
                  ? 'bg-orange-600 hover:bg-orange-700 font-semibold flex-1'
                  : 'font-semibold flex-1'
              }
            >
              🔧 Bachillerato Técnico
            </Button>
            <Button
              size="lg"
              variant={especialidadActual === EspecialidadCurso.CIENCIAS ? 'default' : 'outline'}
              onClick={() => onNivelChange(nivelSeleccionado.nivel, EspecialidadCurso.CIENCIAS)}
              className={
                especialidadActual === EspecialidadCurso.CIENCIAS
                  ? 'bg-green-600 hover:bg-green-700 font-semibold flex-1'
                  : 'font-semibold flex-1'
              }
            >
              🧬 Bachillerato en Ciencias
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}