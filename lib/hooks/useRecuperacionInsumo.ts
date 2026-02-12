import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recuperacionInsumoService } from '../services/recuperacion-insumo';
import { toast } from 'sonner';

export function useRecuperacionInsumo(calificacion_insumo_id: string) {
  const queryClient = useQueryClient();

  const { data: historial, isLoading, error, refetch } = useQuery({
    queryKey: ['recuperaciones', calificacion_insumo_id],
    queryFn: () => recuperacionInsumoService.getByCalificacion(calificacion_insumo_id),
    enabled: !!calificacion_insumo_id,
  });

  const createMutation = useMutation({
    mutationFn: recuperacionInsumoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones', calificacion_insumo_id] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      toast.success('Recuperación registrada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar recuperación');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nota_recuperacion?: number; observaciones?: string } }) =>
      recuperacionInsumoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones', calificacion_insumo_id] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      toast.success('Recuperación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar recuperación');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: recuperacionInsumoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones', calificacion_insumo_id] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      toast.success('Intento de recuperación eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar recuperación');
    },
  });

  return {
    historial: historial || null,
    recuperaciones: historial?.recuperaciones || [],
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