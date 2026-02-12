'use client';

import { useRouter } from 'next/navigation';
import { MateriaCurso } from '@/lib/types/materia-curso.types';
import { Button } from '@/lib/components/ui/button';

interface CursoCardProps {
  materiaCurso: MateriaCurso;
}

const COLORES_CARD = [
  'bg-red-600', 'bg-yellow-400', 'bg-gray-800', 'bg-blue-600',
  'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-teal-600'
];

export function CursoCard({ materiaCurso }: CursoCardProps) {
  const router = useRouter();
  const cursoData = materiaCurso.curso;
  const materiaData = materiaCurso.materia;

  const formatNivel = (nivel: string) => {
    if (nivel.includes('BACHILLERATO')) {
      const partes = nivel.split(' ');
      return partes.map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
    }
    const niveles: any = { 'OCTAVO': '8vo', 'NOVENO': '9no', 'DECIMO': '10mo' };
    return niveles[nivel] || nivel;
  };

  const handleNavigate = () => {
    router.push(`/docente/materias/${materiaCurso.id}/calificaciones`);
  };

  const id = materiaCurso.id;
  const colorIndex = parseInt(id.substring(0, 8), 16) % COLORES_CARD.length;
  const colorHeader = COLORES_CARD[colorIndex];

  return (
    /* Card estándar sin lógica de tutor */
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative max-w-sm">
      <div className={`h-24 ${colorHeader}`}></div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {cursoData.paralelo} - {materiaData.nombre.toUpperCase()} / {formatNivel(cursoData.nivel)} {cursoData.especialidad} / {cursoData.periodo_lectivo.nombre}
        </h3>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer w-full"
            onClick={handleNavigate}
          >
            Ir al curso
          </Button>
        </div>
      </div>
    </div>
  );
}