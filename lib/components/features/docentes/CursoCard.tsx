// nextjs-frontend/lib/components/features/docentes/CursoCard.tsx
'use client';

import { useRouter } from 'next/navigation';
import { MoreVertical, Star, FileText } from 'lucide-react';
import { MateriaCurso } from '@/lib/types/materia-curso.types';
import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/lib/components/ui/dropdown-menu';

interface CursoCardProps {
  materiaCurso: MateriaCurso;
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

export function CursoCard({ materiaCurso, docenteNombre = 'Usuario', isTutor = false }: CursoCardProps) {
  const router = useRouter();
  
  const cursoData = materiaCurso.curso;
  const materiaData = materiaCurso.materia;

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

  const handleNavigate = () => {
    router.push(`/docente/materias/${materiaCurso.id}/calificaciones`);
  };

  const handleReportes = () => {
    router.push(`/docente/tutoria/${cursoData.id}/reportes`);
  };

  // Asignar color basado en el hash del id para consistencia
  const id = materiaCurso.id;
  const colorIndex = parseInt(id.substring(0, 8), 16) % COLORES_CARD.length;
  const colorHeader = COLORES_CARD[colorIndex];

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
      <div className={`h-24 ${colorHeader}`}></div>
      
      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {cursoData.paralelo} - {materiaData.nombre.toUpperCase()} / {formatNivel(cursoData.nivel)} {(cursoData.especialidad)} / {(cursoData.periodo_lectivo.nombre)}
        </h3>
        
        {/* Acciones */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            onClick={handleNavigate}
          >
            Ir al curso
          </Button>
          
          {isTutor ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className="border-yellow-400 hover:bg-yellow-50"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleReportes}>
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Reportes Individuales
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="outline"
              size="icon"
              className="border-gray-300 hover:bg-gray-50 cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}