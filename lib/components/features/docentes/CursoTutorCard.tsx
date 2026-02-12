'use client';

import { useRouter } from 'next/navigation';
import { Users, Star, GraduationCap } from 'lucide-react'; // Cambié CircleUser por GraduationCap por si no lo tienes
import { Card } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Button } from '@/lib/components/ui/button';
import { Curso } from '@/lib/types/curso.types';

interface CursoTutorCardProps {
  curso: Curso;
}

export function CursoTutorCard({ curso }: CursoTutorCardProps) {
  const router = useRouter();

  const formatNivel = (nivel: string) => {
    if (nivel.includes('BACHILLERATO')) {
      return nivel.split(' ').map(p => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
    }
    const niveles: any = { 'OCTAVO': '8vo', 'NOVENO': '9no', 'DECIMO': '10mo' };
    return niveles[nivel] || nivel;
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ring-4 ring-yellow-400 ring-offset-2 relative w-full">
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold shadow-lg">
          <Star className="w-3 h-3 mr-1 fill-current" />
          MI TUTORÍA
        </Badge>
      </div>

      <div className="h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center">
         <Star className="w-8 h-8 text-gray-900/20 fill-current" />
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {formatNivel(curso.nivel)} {curso.especialidad} - {curso.paralelo}
        </h3>
        <p className="text-xs text-gray-500 mb-3">{curso.periodo_lectivo.nombre}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">
            {curso.estudiantes_matriculados} Estudiantes matriculados
          </span>
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <Button 
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer w-full transition-colors"
            onClick={() => router.push(`/docente/tutoria/${curso.id}`)}
          >
            Gestionar mi tutoría
          </Button>
        </div>
      </div>
    </Card>
  );
}