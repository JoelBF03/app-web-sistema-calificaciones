// nextjs-frontend/lib/components/features/docentes/CursoCard.tsx

import { MoreVertical, Star } from 'lucide-react';
import { MateriaCurso } from '@/lib/types/materia-curso.types';
import { Curso } from '@/lib/types/curso.types';
import { Badge } from '@/lib/components/ui/badge';

interface CursoCardProps {
  materiaCurso?: MateriaCurso;
  curso?: Curso;
  docenteNombre?: string;
  isTutor?: boolean;
}

const COLORES_CARD = [
  'bg-red-600',
  'bg-yellow-400', 
  'bg-gray-800',
  'bg-blue-600',
  'bg-green-600',
  'bg-purple-600',
  'bg-orange-600',
  'bg-teal-600'
];

export function CursoCard({ materiaCurso, curso, docenteNombre = 'Usuario', isTutor = false }: CursoCardProps) {
  // Si es tutor, usar el curso directamente. Si no, usar materiaCurso
  const cursoData = isTutor ? curso! : materiaCurso!.curso;
  const materiaData = materiaCurso?.materia;

  const formatNivel = (nivel: string) => {
    if (nivel.includes('BACHILLERATO')) {
      const partes = nivel.split(' ');
      return partes.map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
    }
    const niveles: any = {
      'OCTAVO': '8vo',
      'NOVENO': '9no', 
      'DECIMO': '10mo'
    };
    return niveles[nivel] || nivel;
  };

  // Asignar color basado en el hash del id para consistencia
  const id = materiaCurso?.id || curso?.id || '';
  const colorIndex = parseInt(id.substring(0, 8), 16) % COLORES_CARD.length;
  const colorHeader = COLORES_CARD[colorIndex];

  // Si es tutor, usar color amarillo institucional
  const finalColorHeader = isTutor ? 'bg-yellow-400' : colorHeader;

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${isTutor ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}`}>
      {/* Badge de tutor */}
      {isTutor && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold shadow-lg">
            <Star className="w-3 h-3 mr-1 fill-current" />
            TUTOR
          </Badge>
        </div>
      )}

      {/* Header con color */}
      <div className={`h-24 ${finalColorHeader}`}></div>
      
      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isTutor 
            ? `${cursoData.paralelo} - TUTORÍA / ${formatNivel(cursoData.nivel)} EGB`
            : `${cursoData.paralelo} - ${materiaData?.nombre.toUpperCase()} / ${formatNivel(cursoData.nivel)} EGB`
          }
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Prof. {docenteNombre}
        </p>
        
        {/* Acciones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <button 
            className={`${isTutor ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' : 'bg-red-600 hover:bg-red-700 text-white'} px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
            onClick={() => {
              // TODO: Navegar al curso
              console.log('Ir al curso:', isTutor ? curso?.id : materiaCurso?.id);
            }}
          >
            {isTutor ? 'Gestionar tutoría' : 'Ir al curso'}
          </button>
          <button className="w-9 h-9 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-yellow-400 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}