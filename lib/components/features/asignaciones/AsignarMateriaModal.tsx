'use client';

import { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/lib/components/ui/select';
import { useMaterias } from '@/lib/hooks/useMaterias';
import { useMateriaCurso } from '@/lib/hooks/useMateriaCurso';
import { Curso } from '@/lib/types/curso.types';
import { EstadoMateria, NivelEducativo, TipoCalificacion } from '@/lib/types/materia.types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  cursos: Curso[];
  nivelEducativo: NivelEducativo[];
  materiasYaAsignadas: Set<string>;
  onSave: () => void;
}

export function AsignarMateriaModal({
  open,
  onClose,
  cursos,
  nivelEducativo,
  materiasYaAsignadas,
  onSave,
}: Props) {
  const { materias } = useMaterias();
  const { crearMateriaCurso, loading } = useMateriaCurso();

  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('');

  const materiasDisponibles = materias.filter(
    (materia) =>
      nivelEducativo.includes(materia.nivelEducativo) &&
      materia.estado === EstadoMateria.ACTIVO &&
      materia.tipoCalificacion !== TipoCalificacion.CUALITATIVA &&
      !materiasYaAsignadas.has(materia.id)
  );

  const handleSave = async () => {
    if (!materiaSeleccionada) {
      toast.error('Selecciona una materia');
      return;
    }

    if (cursos.length === 0) {
      toast.error('No hay cursos disponibles');
      return;
    }

    if (materiasYaAsignadas.has(materiaSeleccionada)) {
      toast.error('Esta materia ya está asignada a este nivel');
      return;
    }

    const periodoLectivoId = cursos[0].periodo_lectivo_id;

    if (!periodoLectivoId) {
      toast.error('No se pudo obtener el período lectivo');
      return;
    }

    try {
      const promesas = cursos.map(curso =>
        crearMateriaCurso({
          curso_id: curso.id,
          materia_id: materiaSeleccionada,
          periodo_lectivo_id: periodoLectivoId,
        })
      );

      await Promise.all(promesas);

      toast.success(`Materia agregada a ${cursos.length} paralelo(s)`);
      setMateriaSeleccionada('');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('Error al agregar materia');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Agregar Materia
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

        <div className="py-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Seleccionar Materia
            </label>
            <Select value={materiaSeleccionada} onValueChange={setMateriaSeleccionada}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Seleccione una materia..." />
              </SelectTrigger>
              <SelectContent>
                {materiasDisponibles.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {materiasYaAsignadas.size > 0
                      ? 'Todas las materias ya están asignadas'
                      : 'No hay materias disponibles'}
                  </div>
                ) : (
                  materiasDisponibles.map((materia) => (
                    <SelectItem key={materia.id} value={materia.id}>
                      {materia.nombre}
                      <span className="text-xs text-gray-500 ml-2">
                        ({materia.nivelEducativo})
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> La materia se agregará a los {cursos.length} paralelo
              {cursos.length !== 1 ? 's' : ''} disponibles. Luego podrás asignar docentes por
              paralelo.
            </p>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!materiaSeleccionada || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Agregando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Agregar Materia
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}