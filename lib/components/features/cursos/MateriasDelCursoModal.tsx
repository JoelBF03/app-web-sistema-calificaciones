'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, BookOpen, User, CheckCircle, XCircle, ArrowRight, GraduationCap } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Curso } from '@/lib/types/curso.types';
import { MateriaCurso, MateriaCursoByCursoResponse, EstadoMateriaCurso } from '@/lib/types/materia-curso.types';
import { TipoCalificacion } from '@/lib/types/materia.types';
import { materiaCursoService } from '@/lib/services/materia-curso';
import { toast } from 'sonner';

interface MateriasDelCursoModalProps {
  curso: Curso | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MateriasDelCursoModal({
  curso,
  isOpen,
  onClose,
}: MateriasDelCursoModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState<MateriaCurso[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && curso) {
      cargarMaterias();
    }
  }, [isOpen, curso]);

  const cargarMaterias = async () => {
    if (!curso) return;

    setLoading(true);
    setError(null);
    try {
      const response = await materiaCursoService.findByCurso(curso.id);
      setMaterias(response.materias || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cargar materias';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerCalificaciones = (materiaCurso: MateriaCurso) => {
    if (!materiaCurso.docente_id) {
      toast.error('Esta materia no tiene docente asignado');
      return;
    }
    
    router.push(`/docente/materias/${materiaCurso.id}/calificaciones`);
    onClose();
  };

  const handleVerComponentesCualitativos = () => {
    router.push(`/docente/tutoria/${curso!.id}`);
    onClose();
  };

  if (!isOpen || !curso) return null;

  const materiasCuantitativas = materias.filter(
    m => m.materia.tipoCalificacion === TipoCalificacion.CUANTITATIVA
  );

  const tieneCualitativas = materias.some(
    m => m.materia.tipoCalificacion === TipoCalificacion.CUALITATIVA
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Materias del Curso
              </h2>
              <p className="text-blue-100">
                {curso.nivel} &quot;{curso.paralelo}&quot; - {curso.especialidad}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          ) : materias.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay materias asignadas a este curso</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tieneCualitativas && (
                <Card className="hover:shadow-md transition-shadow border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <GraduationCap className="w-6 h-6 text-purple-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg text-purple-900">
                              Componentes Cualitativos
                            </h3>
                            <Badge className="bg-purple-500 hover:bg-purple-600 text-white">
                              Tutoría
                            </Badge>
                          </div>

                          <p className="text-sm text-purple-700">
                            Calificación cualitativa de componentes de tutoría
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleVerComponentesCualitativos}
                        className="ml-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      >
                        Ver Componentes
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {materiasCuantitativas.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No hay materias cuantitativas asignadas</p>
                </div>
              ) : (
                materiasCuantitativas.map((materiaCurso) => (
                  <Card
                    key={materiaCurso.id}
                    className="hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {materiaCurso.materia.nombre}
                              </h3>
                              <Badge
                                variant={
                                  materiaCurso.estado === EstadoMateriaCurso.ACTIVO
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={
                                  materiaCurso.estado === EstadoMateriaCurso.ACTIVO
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {materiaCurso.estado === EstadoMateriaCurso.ACTIVO ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Activo
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Inactivo
                                  </>
                                )}
                              </Badge>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {materiaCurso.docente ? (
                                  <span>
                                    {materiaCurso.docente.nombres}{' '}
                                    {materiaCurso.docente.apellidos}
                                  </span>
                                ) : (
                                  <span className="text-orange-600 font-medium">
                                    Sin docente asignado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {materiaCurso.docente_id && (
                          <Button
                            onClick={() => handleVerCalificaciones(materiaCurso)}
                            className="ml-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          >
                            Ver Calificaciones
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{materiasCuantitativas.length}</span> materia(s) cuantitativa(s)
            {tieneCualitativas && <span className="ml-2">+ Componentes Cualitativos</span>}
          </p>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}