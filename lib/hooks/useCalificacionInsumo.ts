import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calificacionInsumoService } from '../services/calificacion-insumo';
import { toast } from 'sonner';

export function useCalificacionInsumo(insumo_id?: string) {
  const queryClient = useQueryClient();

  const { data: calificaciones, isLoading, error, refetch } = useQuery({
    queryKey: ['calificaciones-insumo', insumo_id],
    queryFn: () => calificacionInsumoService.getByInsumo(insumo_id!),
    enabled: !!insumo_id,
  });

  const { data: sinCalificar } = useQuery({
    queryKey: ['sin-calificar-insumo', insumo_id],
    queryFn: () => calificacionInsumoService.estudiantesSinCalificar(insumo_id!),
    enabled: !!insumo_id,
  });

  const createBatchMutation = useMutation({
    mutationFn: calificacionInsumoService.createBatch,
    onSuccess: () => {
      if (insumo_id) {
        queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo', insumo_id] });
        queryClient.invalidateQueries({ queryKey: ['sin-calificar-insumo', insumo_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['calificaciones-batch'] });
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
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
      if (insumo_id) {
        queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo', insumo_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-batch'] });
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Calificación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar calificación');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: calificacionInsumoService.remove,
    onSuccess: () => {
      if (insumo_id) {
        queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo', insumo_id] });
        queryClient.invalidateQueries({ queryKey: ['sin-calificar-insumo', insumo_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      queryClient.invalidateQueries({ queryKey: ['calificaciones-batch'] });
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Calificación eliminada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar calificación');
    },
  });

  const findOneMutation = useMutation({
    mutationFn: calificacionInsumoService.findOne,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cargar calificación');
    },
  });

  return {
    calificaciones: calificaciones || [],
    sinCalificar: sinCalificar || [],
    isLoading,
    error,
    refetch,
    guardarCalificaciones: createBatchMutation.mutate,
    actualizarCalificacion: updateMutation.mutate,
    eliminarCalificacion: deleteMutation.mutate,
    obtenerCalificacion: findOneMutation.mutateAsync,
    isSaving: createBatchMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoadingOne: findOneMutation.isPending,
  };
}

// Nuevo hook para batch
export function useCalificacionesBatch(materia_curso_id?: string, trimestre_id?: string) {
  const queryClient = useQueryClient();

  const { data: calificacionesPorInsumo, isLoading, error, refetch } = useQuery({
    queryKey: ['calificaciones-batch', materia_curso_id, trimestre_id],
    queryFn: () => calificacionInsumoService.getByMateriaCursoYTrimestre(materia_curso_id!, trimestre_id!),
    enabled: !!materia_curso_id && !!trimestre_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    calificacionesPorInsumo: calificacionesPorInsumo || {},
    isLoading,
    error,
    refetch,
  };
}