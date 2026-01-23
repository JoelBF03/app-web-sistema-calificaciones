import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calificacionCualitativaService } from '../services/calificacion-cualitativa';
import { toast } from 'sonner';
import { CalificarMasivoDto } from '@/lib/types/calificaciones.types';

export function useCalificacionCualitativa(curso_id?: string, trimestre_id?: string) {
  const queryClient = useQueryClient();

  // Obtener calificaciones por curso y trimestre
  const {
    data: calificaciones,
    isLoading,
    error
  } = useQuery({
    queryKey: ['calificaciones-cualitativas', curso_id, trimestre_id],
    queryFn: () => calificacionCualitativaService.getByCursoYTrimestre(curso_id!, trimestre_id!),
    enabled: !!curso_id && !!trimestre_id,
  });

  // Mutación para calificar masivo
  const calificarMasivoMutation = useMutation({
    mutationFn: (dto: CalificarMasivoDto) => calificacionCualitativaService.calificarMasivo(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['calificaciones-cualitativas', curso_id, trimestre_id]
      });
      toast.success(
        `Guardado: ${data.resultados.creados} creadas, ${data.resultados.actualizados} actualizadas`
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar calificaciones');
    },
  });

  // Mutación para actualizar individual
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { calificacion?: string | null } }) =>
      calificacionCualitativaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calificaciones-cualitativas', curso_id, trimestre_id]
      });
      toast.success('Calificación actualizada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar calificación');
    },
  });

  return {
    calificaciones: calificaciones || [],
    isLoading,
    error,
    guardarCalificaciones: calificarMasivoMutation.mutate,
    updateCalificacion: updateMutation.mutate,
    isSaving: calificarMasivoMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}

/**
 * Hook para obtener componentes por nivel educativo
 */
export function useComponentesCualitativos(nivel?: string) {
  const {
    data: componentes,
    isLoading,
    error
  } = useQuery({
    queryKey: ['componentes-cualitativos', nivel],
    queryFn: () => calificacionCualitativaService.getComponentesPorNivel(nivel!),
    enabled: !!nivel,
  });

  return {
    componentes: componentes || [],
    isLoading,
    error,
  };
}