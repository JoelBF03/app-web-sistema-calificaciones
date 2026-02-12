import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calificacionExamenService } from '../services/calificacion-examen';
import { toast } from 'sonner';

export function useCalificacionExamen(materia_curso_id: string, trimestre_id: string) {
  const queryClient = useQueryClient();

  const { data: calificaciones, isLoading, error } = useQuery({
    queryKey: ['calificaciones-examen', materia_curso_id, trimestre_id],
    queryFn: () => calificacionExamenService.getByMateriaCursoYTrimestre(materia_curso_id, trimestre_id),
    enabled: !!materia_curso_id && !!trimestre_id,
  });

  const createBatchMutation = useMutation({
    mutationFn: calificacionExamenService.createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-examen', materia_curso_id, trimestre_id] });
      toast.success('Calificaciones de examen guardadas');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar calificaciones');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { calificacion_examen: number; observaciones?: string } }) =>
      calificacionExamenService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-examen', materia_curso_id, trimestre_id] });
      toast.success('Calificación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar calificación');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: calificacionExamenService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-examen', materia_curso_id, trimestre_id] });
      toast.success('Calificación eliminada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar calificación');
    },
  });

  const { data: sinCalificar } = useQuery({
    queryKey: ['sin-calificar-examen', materia_curso_id, trimestre_id],
    queryFn: () => calificacionExamenService.estudiantesSinCalificar(materia_curso_id, trimestre_id),
    enabled: !!materia_curso_id && !!trimestre_id,
  });

  return {
    calificaciones: calificaciones || [],
    sinCalificar: sinCalificar || [],
    isLoading,
    error,
    eliminarCalificacion: deleteMutation.mutate,
    guardarCalificaciones: createBatchMutation.mutate,
    updateCalificacion: updateMutation.mutate,
    isSaving: createBatchMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}