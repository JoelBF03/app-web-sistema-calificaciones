import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calificacionInsumoService } from '../services/calificacion-insumo';
import { toast } from 'sonner';

export function useCalificacionInsumo(insumo_id: string) {
  const queryClient = useQueryClient();

  const { data: calificaciones, isLoading, error } = useQuery({
    queryKey: ['calificaciones-insumo', insumo_id],
    queryFn: () => calificacionInsumoService.getByInsumo(insumo_id),
    enabled: !!insumo_id,
  });

  const createBatchMutation = useMutation({
    mutationFn: calificacionInsumoService.createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo', insumo_id] });
      toast.success('Calificaciones guardadas correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar calificaciones');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nota: number; observaciones?: string } }) => 
      calificacionInsumoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo', insumo_id] });
      toast.success('Calificación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar calificación');
    },
  });

  const { data: sinCalificar } = useQuery({
    queryKey: ['sin-calificar-insumo', insumo_id],
    queryFn: () => calificacionInsumoService.estudiantesSinCalificar(insumo_id),
    enabled: !!insumo_id,
  });

  return {
    calificaciones: calificaciones || [],
    sinCalificar: sinCalificar || [],
    isLoading,
    error,
    guardarCalificaciones: createBatchMutation.mutate,
    updateCalificacion: updateMutation.mutate,
    isSaving: createBatchMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}