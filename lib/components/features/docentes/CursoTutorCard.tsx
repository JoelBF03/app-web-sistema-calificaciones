// nextjs-frontend/lib/components/features/docente/CursoTutorCard.tsx

import { GraduationCap, Users, Star, Calendar } from 'lucide-react';
import { Card } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import { Curso } from '@/lib/types/curso.types';

interface CursoTutorCardProps {
  curso: Curso;
}

export function CursoTutorCard({ curso }: CursoTutorCardProps) {
  const formatNivel = (nivel: string) => {
    if (nivel.includes('BACHILLERATO')) {
      return nivel.split(' ').map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
    }
    return nivel.charAt(0) + nivel.slice(1).toLowerCase();
  };

  return (
    <Card className="overflow-hidden border-2 border-yellow-400 shadow-2xl">
      {/* Header destacado para tutor */}
      <div className="h-32 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-900">
            <Star className="w-12 h-12 mx-auto mb-2 fill-current" />
            <p className="text-sm font-bold uppercase tracking-wide">Mi Tutoría</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4 bg-gradient-to-br from-yellow-50 to-white">
        {/* Título */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-yellow-600" />
            {formatNivel(curso.nivel)} - Paralelo {curso.paralelo}
          </h3>
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {curso.periodo_lectivo.nombre}
          </p>
        </div>

        {/* Especialidad Badge */}
        <div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {curso.especialidad}
          </Badge>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center gap-2 pt-2 border-t border-yellow-200">
          <Users className="w-5 h-5 text-yellow-700" />
          <span className="text-lg font-semibold text-gray-900">
            {curso.estudiantes_matriculados} estudiantes
          </span>
        </div>

        {/* Acciones */}
        <div className="pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            onClick={() => {
              // TODO: Navegar al detalle del curso como tutor
              console.log('Ir a mi tutoría:', curso.id);
            }}
          >
            Gestionar mi curso
          </Button>
        </div>
      </div>
    </Card>
  );
}