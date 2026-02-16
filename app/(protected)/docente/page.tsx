'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useMateriasDocente } from '@/lib/hooks/useMateriasDocente';
import { CursoCard } from '@/lib/components/features/docentes/CursoCard';
import { CursoTutorCard } from '@/lib/components/features/docentes/CursoTutorCard';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/lib/components/ui/alert';

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

  // ✅ Si NO hay materias NI curso tutor, mostrar mensaje de periodo inactivo
  if (materiasAsignadas.length === 0 && !cursoTutor) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-12">
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300">
          <Calendar className="h-6 w-6 text-blue-600" />
          <AlertTitle className="text-xl font-semibold text-blue-900 mb-2">
            No hay período lectivo activo
          </AlertTitle>
          <AlertDescription className="text-blue-800">
            <div className="space-y-3">
              <p className="text-base">
                Bienvenido/a <strong>{docenteNombre}</strong>, actualmente no hay un período lectivo activo en el sistema.
              </p>
              <p className="text-base">
                Esto puede deberse a que:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>El período lectivo actual ha finalizado</li>
                <li>El nuevo período lectivo aún no ha sido activado por el administrador</li>
                <li>El sistema está en proceso de transición entre períodos</li>
              </ul>
              <p className="text-base mt-4">
                Podrás acceder a tus cursos una vez que el administrador active el nuevo período lectivo. 
                Mientras tanto, puedes actualizar tu perfil desde la sección <strong>"Mi perfil"</strong>.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto mt-5 space-y-12">
      {cursoTutor && (
        <section>
          <h2 className="text-4xl font-semibold text-gray-900 mb-6 border-b-4 border-yellow-500 pb-3 inline-block">
            Mi Tutoría
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CursoTutorCard curso={cursoTutor} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-4xl font-semibold text-gray-900 mb-6 border-b-4 border-red-600 pb-3 inline-block">
          Mis Cursos
        </h2>

        {materiasAsignadas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tienes materias asignadas aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materiasAsignadas.map((materiaCurso) => (
              <CursoCard
                key={materiaCurso.id}
                materiaCurso={materiaCurso}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}