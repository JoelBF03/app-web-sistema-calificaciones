'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, Users, Star, ArrowRight } from 'lucide-react';
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
    const niveles: any = {
      'OCTAVO': '8vo',
      'NOVENO': '9no', 
      'DECIMO': '10mo'
    };
    return niveles[nivel] || nivel;
  };

  const handleNavegar = () => {
    router.push(`/docente/tutoria/${curso.id}`);
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ring-4 ring-yellow-400 ring-offset-2 relative">
      
      {/* Badge de tutor igual al de CursoCard */}
      <div className="absolute top-4 right-4 z-10">
        <Badge className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold shadow-lg">
          <Star className="w-3 h-3 mr-1 fill-current" />
          MI TUTORÍA
        </Badge>
      </div>

      {/* Header con el formato de color, pero manteniendo tu degradado original */}
      <div className="h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center">
         <Star className="w-8 h-8 text-gray-900/20 fill-current" />
      </div>
      
      {/* Contenido con el mismo padding y espaciado que CursoCard */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {formatNivel(curso.nivel)} {curso.especialidad} - {curso.paralelo}/ {curso.periodo_lectivo.nombre}
        </h3>
        
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500">
            {curso.estudiantes_matriculados} Estudiantes matriculados
          </span>
        </div>
        
        {/* Acciones idénticas en tamaño al CursoCard */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button 
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer w-full transition-colors"
            onClick={handleNavegar}
          >
            Gestionar mi tutoría
          </Button>
        </div>
      </div>
    </Card>
  );
}