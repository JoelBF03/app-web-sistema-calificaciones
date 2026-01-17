import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calificacionProyectoService } from '../services/calificacion-proyecto';
import { toast } from 'sonner';

export function useCalificacionProyecto(curso_id: string, trimestre_id: string, isTutor: boolean = false) {
  const queryClient = useQueryClient();

  const { data: calificaciones, isLoading, error } = useQuery({
    queryKey: ['calificaciones-proyecto', curso_id, trimestre_id],
    queryFn: () => calificacionProyectoService.getByCursoYTrimestre(curso_id, trimestre_id),
    enabled: !!curso_id && !!trimestre_id,
  });

  const createMutation = useMutation({
    mutationFn: calificacionProyectoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-proyecto', curso_id, trimestre_id] });
      toast.success('Calificaciones de proyecto guardadas');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar calificaciones');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { calificacion_proyecto: number; observaciones?: string } }) =>
      calificacionProyectoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-proyecto', curso_id, trimestre_id] });
      toast.success('Calificación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar calificación');
    },
  });

  const { data: sinCalificar } = useQuery({
    queryKey: ['sin-calificar-proyecto', curso_id, trimestre_id],
    queryFn: () => calificacionProyectoService.estudiantesSinCalificar(curso_id, trimestre_id),
    enabled: !!curso_id && !!trimestre_id && isTutor,
  });

  return {
    calificaciones: calificaciones || [],
    sinCalificar: sinCalificar || [],
    isLoading: isTutor ? isLoading : false,
    error,
    guardarCalificaciones: createMutation.mutate,
    updateCalificacion: updateMutation.mutate,
    isSaving: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['calificaciones-proyecto', curso_id, trimestre_id] })
  };
}