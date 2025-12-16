// nextjs-frontend/lib/components/features/estudiantes/ModalHistorialEstudiante.tsx

import { Estudiante } from '@/lib/types/estudiante.types';
import { X, History, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card } from '@/lib/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EspecialidadCurso } from '@/lib/types';

interface ModalHistorialEstudianteProps {
  estudiante: Estudiante;
  onClose: () => void;
}

export function ModalHistorialEstudiante({
  estudiante,
  onClose,
}: ModalHistorialEstudianteProps) {
  const formatearFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  const matriculasOrdenadas = estudiante.matriculas?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial Académico
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-purple-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del estudiante */}
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">
                  {estudiante.nombres_completos.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {estudiante.nombres_completos}
                </h3>
                <p className="text-sm text-gray-600">CI: {estudiante.estudiante_cedula}</p>
              </div>
            </div>
          </Card>

          {/* Timeline de matrículas */}
          {matriculasOrdenadas && matriculasOrdenadas.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Historial de Matrículas ({matriculasOrdenadas.length})
              </h3>

              <div className="relative space-y-6">
                {/* Línea vertical */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-200" />

                {matriculasOrdenadas.map((matricula, index) => (
                  <div key={matricula.id} className="relative pl-12">
                    {/* Punto en la línea */}
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        matricula.estado === 'ACTIVO'
                          ? 'bg-green-500'
                          : matricula.estado === 'RETIRADO'
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>

                    {/* Card de matrícula */}
                    <Card
                      className={`p-4 ${
                        matricula.estado === 'ACTIVO'
                          ? 'border-green-300 bg-green-50'
                          : matricula.estado === 'RETIRADO'
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          {/* Período y curso */}
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">
                              {matricula.periodo_lectivo?.nombre || 'Período no disponible'}
                            </h4>
                            <p className="text-gray-700 font-semibold">
                                {matricula.curso?.nivel || 'N/A'} "{matricula.curso?.paralelo || 'N/A'}"
                                {matricula.curso?.especialidad && matricula.curso.especialidad !== EspecialidadCurso.BASICA && (
                                <span className="text-purple-600"> - {matricula.curso.especialidad}</span>
                                )}
                            </p>
                          </div>

                          {/* Número de matrícula */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Matrícula N° {matricula.numero_de_matricula}</span>
                          </div>

                          {/* Fecha de creación */}
                          <div className="text-xs text-gray-500">
                            Registrado el {formatearFecha(matricula.createdAt)}
                          </div>

                          {/* Observaciones si las hay */}
                          {matricula.observaciones && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              <span className="font-semibold text-yellow-800">Observaciones:</span>{' '}
                              <span className="text-yellow-700">{matricula.observaciones}</span>
                            </div>
                          )}
                        </div>

                        {/* Badge de estado */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            matricula.estado === 'ACTIVO'
                              ? 'bg-green-100 text-green-800'
                              : matricula.estado === 'RETIRADO'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {matricula.estado}
                        </span>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">
                Sin historial de matrículas
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Este estudiante aún no tiene matrículas registradas
              </p>
            </div>
          )}

          {/* Botón cerrar */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}