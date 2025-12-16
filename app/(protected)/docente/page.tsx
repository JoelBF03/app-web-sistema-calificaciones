// nextjs-frontend/app/(protected)/docente/page.tsx

'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useMateriasDocente } from '@/lib/hooks/useMateriasDocente';
import { CursoCard } from '@/lib/components/features/docentes/CursoCard';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
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

  return (
    <div className="p-8 max-w-6xl mx-auto mt-5">
      <section>
        <h2 className="text-4xl font-semibold text-gray-900 mb-6 border-b-4 border-red-600 pb-3 inline-block">
          Mis cursos
        </h2>

        {materiasAsignadas.length === 0 && !cursoTutor && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tienes cursos asignados aún.</p>
          </div>
        )}

        {(materiasAsignadas.length > 0 || cursoTutor) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card de tutoría primero si existe */}
            {cursoTutor && (
              <CursoCard
                key={`tutor-${cursoTutor.id}`}
                curso={cursoTutor}
                docenteNombre={docenteNombre}
                isTutor={true}
              />
            )}

            {/* Resto de materias */}
            {materiasAsignadas.map((materiaCurso) => (
              <CursoCard
                key={materiaCurso.id}
                materiaCurso={materiaCurso}
                docenteNombre={docenteNombre}
                isTutor={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}