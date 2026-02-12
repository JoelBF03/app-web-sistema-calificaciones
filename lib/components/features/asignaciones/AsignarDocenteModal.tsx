'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Materia } from '@/lib/types/materia.types';
import { Curso, NivelCurso } from '@/lib/types/curso.types';
import { Docente, NivelAsignado } from '@/lib/types/docente.types';
import { useMateriaCurso } from '@/lib/hooks/useMateriaCurso';
import { toast } from 'sonner';

interface DocenteAsignacion {
  cursoId: string;
  docenteId: string | null;
  materiaCursoId?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  materia: Materia | null;
  cursos: Curso[];
  docentes: Docente[];
  onSave: () => void;
}

export function AsignarDocenteModal({
  open,
  onClose,
  materia,
  cursos,
  docentes,
  onSave,
}: Props) {
  const [asignaciones, setAsignaciones] = useState<DocenteAsignacion[]>([]);
  const [cargando, setCargando] = useState(false);
  
  const { 
    crearMateriaCurso, 
    actualizarMateriaCurso, 
    obtenerCursosPorMateria,
    loading 
  } = useMateriaCurso();

  const nivelesBasicos = [NivelCurso.OCTAVO, NivelCurso.NOVENO, NivelCurso.DECIMO];
  const esBasica = cursos.length > 0 && nivelesBasicos.includes(cursos[0].nivel);

  const docentesFiltrados = docentes.filter((docente) => {
    if (docente.nivelAsignado === NivelAsignado.GLOBAL) return true;
    if (docente.nivelAsignado === NivelAsignado.BASICA && esBasica) return true;
    if (docente.nivelAsignado === NivelAsignado.BACHILLERATO && !esBasica) return true;
    return false;
  });

  useEffect(() => {
    if (open && materia && cursos.length > 0) {
      cargarAsignacionesExistentes();
    }
  }, [open, materia, cursos]);

  const cargarAsignacionesExistentes = async () => {
    if (!materia) return;

    setCargando(true);
    try {
      const data = await obtenerCursosPorMateria(materia.id);
      
      const asignacionesMap = new Map();
      if (data?.cursos) {
        data.cursos.forEach((item: any) => {
          asignacionesMap.set(item.curso.id, {
            materiaCursoId: item.id,
            docenteId: item.docente?.id || null,
          });
        });
      }

      setAsignaciones(
        cursos.map((curso) => {
          const existente = asignacionesMap.get(curso.id);
          return {
            cursoId: curso.id,
            docenteId: existente?.docenteId || null,
            materiaCursoId: existente?.materiaCursoId,
          };
        })
      );
    } catch (error) {
      toast.error('Error al cargar asignaciones');
      setAsignaciones(
        cursos.map((curso) => ({
          cursoId: curso.id,
          docenteId: null,
        }))
      );
    } finally {
      setCargando(false);
    }
  };

  const handleDocenteChange = (cursoId: string, docenteId: string) => {
    setAsignaciones((prev) =>
      prev.map((asig) =>
        asig.cursoId === cursoId
          ? { ...asig, docenteId: docenteId === 'sin-asignar' ? null : docenteId }
          : asig
      )
    );
  };

  const handleSave = async () => {
    if (!materia) return;

    if (cursos.length === 0) {
      toast.error('No hay cursos disponibles');
      return;
    }

    const periodoLectivoId = cursos[0].periodo_lectivo_id;

    if (!periodoLectivoId) {
      toast.error('No se pudo obtener el período lectivo');
      return;
    }

    setCargando(true);
    try {
      for (const asignacion of asignaciones) {
        if (asignacion.materiaCursoId) {
          await actualizarMateriaCurso(asignacion.materiaCursoId, {
            docente_id: asignacion.docenteId || null,
          });
        } else {
          await crearMateriaCurso({
            curso_id: asignacion.cursoId,
            materia_id: materia.id,
            periodo_lectivo_id: periodoLectivoId,
            docente_id: asignacion.docenteId || undefined,
          });
        }
      }

      toast.success('Docentes asignados correctamente');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('Error al guardar asignaciones');
    } finally {
      setCargando(false);
    }
  };

  if (!materia) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              📐 Asignar Docentes - {materia.nombre}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cargando ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📚</div>
              <p>No hay paralelos disponibles</p>
            </div>
          ) : docentesFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <p className="font-semibold mb-2">No hay docentes disponibles para este nivel</p>
              <p className="text-sm">
                Se necesitan docentes con nivel {esBasica ? 'BASICA' : 'BACHILLERATO'} o GLOBAL
              </p>
            </div>
          ) : (
            cursos.map((curso) => {
              const asignacion = asignaciones.find((a) => a.cursoId === curso.id);

              return (
                <div key={curso.id} className="bg-gray-50 rounded-lg p-4 flex items-center gap-4">
                  <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 px-4 py-2 text-base font-bold min-w-[100px] justify-center">
                    {curso.nivel.replace(' BACHILLERATO', '')} {curso.paralelo}
                  </Badge>

                  <Select
                    value={asignacion?.docenteId || 'sin-asignar'}
                    onValueChange={(value) => handleDocenteChange(curso.id, value)}
                  >
                    <SelectTrigger className="flex-1 h-11 border-2 focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                      {docentesFiltrados.map((docente) => (
                        <SelectItem key={docente.id} value={docente.id}>
                          {docente.nombres} {docente.apellidos}
                          <span className="text-xs text-gray-500 ml-2">
                            ({docente.nivelAsignado})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={cargando || loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={cargando || loading}
          >
            {cargando || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}