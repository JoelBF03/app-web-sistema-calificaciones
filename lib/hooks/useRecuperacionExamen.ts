import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recuperacionExamenService } from '../services/recuperacion-examen';
import { toast } from 'sonner';

export function useRecuperacionExamen(calificacion_examen_id: string) {
  const queryClient = useQueryClient();

  const { data: historial, isLoading, error, refetch } = useQuery({
    queryKey: ['recuperaciones-examen', calificacion_examen_id],
    queryFn: () => recuperacionExamenService.getByCalificacion(calificacion_examen_id),
    enabled: !!calificacion_examen_id,
  });

  const createMutation = useMutation({
    mutationFn: recuperacionExamenService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones-examen', calificacion_examen_id] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-examen'] });
      toast.success('Recuperación registrada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar recuperación');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { segundo_examen?: number; trabajo_refuerzo?: number; observaciones?: string } }) =>
      recuperacionExamenService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones-examen', calificacion_examen_id] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-examen'] });
      toast.success('Recuperación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar recuperación');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: recuperacionExamenService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones-examen', calificacion_examen_id] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-examen'] });
      toast.success('Recuperación eliminada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar recuperación');
    },
  });

  return {
    historial: historial || null,
    recuperacion: historial?.recuperacion || null,
    necesitaTrabajoRefuerzo: historial?.necesita_trabajo_refuerzo || false,
    isLoading,
    error,
    refetch,
    crearRecuperacion: createMutation.mutate,
    actualizarRecuperacion: updateMutation.mutate,
    eliminarRecuperacion: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}