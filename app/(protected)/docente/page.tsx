// nextjs-frontend/app/(protected)/docente/page.tsx
'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useMateriasDocente } from '@/lib/hooks/useMateriasDocente';
import { CursoCard } from '@/lib/components/features/docentes/CursoCard';
import { CursoTutorCard } from '@/lib/components/features/docentes/CursoTutorCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

export default function DocenteDashboard() {
  const { usuario } = useAuthStore();
  const { materiasAsignadas, cursoTutor, docente, isLoading, error } = useMateriasDocente();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto" />
          <p className="text-gray-600">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto mt-5">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const docenteNombre = docente ? `${docente.nombres} ${docente.apellidos}` : usuario?.email?.split('@')[0] || 'Usuario';
  const cursoTutorId = cursoTutor?.id;

  return (
    <div className="p-8 max-w-6xl mx-auto mt-5 space-y-12">
      {/* Sección: MI TUTORÍA */}
      {cursoTutor && (
        <section>
          <h2 className="text-4xl font-semibold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-3 inline-block">
            Mi Tutoría
          </h2>
          <div className="max-w-md">
            <CursoTutorCard curso={cursoTutor} />
          </div>
        </section>
      )}

      {/* Sección: MIS CURSOS */}
      <section>
        <h2 className="text-4xl font-semibold text-gray-900 mb-6 border-b-4 border-red-600 pb-3 inline-block">
          Mis Cursos
        </h2>

        {materiasAsignadas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tienes materias asignadas aún.</p>
          </div>
        )}

        {materiasAsignadas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materiasAsignadas.map((materiaCurso) => {
              // ✅ Marcar visualmente si es curso donde es tutor (franja amarilla)
              const esCursoTutor = materiaCurso.curso_id === cursoTutorId;
              
              return (
                <CursoCard
                  key={materiaCurso.id}
                  materiaCurso={materiaCurso}
                  docenteNombre={docenteNombre}
                  isTutor={esCursoTutor}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}