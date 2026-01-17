// nextjs-frontend/lib/hooks/useTiposEvaluacion.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposEvaluacionService } from '../services/tipos-evaluacion';
import { toast } from 'sonner';
import type {
  CreateTipoEvaluacionData,
  CreateBatchTiposEvaluacionData,
  UpdateTipoEvaluacionData,
  TipoEvaluacion
} from '../types/tipos-evaluacion.types';

export function useTiposEvaluacion(periodo_id?: string) {
  const queryClient = useQueryClient();

  // 📋 Query: Tipos de evaluación por período o todos
  const {
    data: tiposEvaluacion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tipos-evaluacion', periodo_id],
    queryFn: () => periodo_id
      ? tiposEvaluacionService.getByPeriodo(periodo_id)
      : tiposEvaluacionService.findAll(),
    enabled: !!periodo_id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // ➕ Mutation: Crear tipo individual
  const createMutation = useMutation({
    mutationFn: (data: CreateTipoEvaluacionData) => tiposEvaluacionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-evaluacion'] });
      toast.success('Tipo de evaluación creado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear tipo de evaluación');
    },
  });

  // ➕ Mutation: Crear los 3 tipos de una vez
  const createBatchMutation = useMutation({
    mutationFn: ({ periodo_id, porcentajes }: { periodo_id: string; porcentajes: CreateBatchTiposEvaluacionData }) =>
      tiposEvaluacionService.createBatch(periodo_id, porcentajes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-evaluacion'] });
      toast.success('Tipos de evaluación configurados correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al configurar tipos de evaluación');
    },
  });

  // ✏️ Mutation: Actualizar tipo
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTipoEvaluacionData }) =>
      tiposEvaluacionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-evaluacion'] });
      toast.success('Porcentaje actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar porcentaje');
    },
  });

  // ✏️ Mutation: Actualizar todos los porcentajes a la vez
  const updateBatchMutation = useMutation({
    mutationFn: ({ periodo_id, porcentajes }: {
      periodo_id: string;
      porcentajes: { insumos: number; proyecto: number; examen: number }
    }) => tiposEvaluacionService.updateBatch(periodo_id, porcentajes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-evaluacion'] });
      toast.success('Porcentajes actualizados exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar porcentajes');
    },
  });

  // Helper: Obtener porcentajes en formato simple
  const porcentajes = {
    insumos: tiposEvaluacion?.find(t => t.nombre === 'INSUMOS')?.porcentaje || 0,
    proyecto: tiposEvaluacion?.find(t => t.nombre === 'PROYECTO')?.porcentaje || 0,
    examen: tiposEvaluacion?.find(t => t.nombre === 'EXAMEN')?.porcentaje || 0,
  };

  return {
    // Data
    tiposEvaluacion: tiposEvaluacion || [],
    porcentajes,
    hayPorcentajes: tiposEvaluacion && tiposEvaluacion.length === 3,
    isLoading,
    error: error?.message || null,
    refetch,

    // Mutations
    createTipo: createMutation.mutateAsync,
    createBatch: createBatchMutation.mutateAsync,
    updateTipo: (id: string, data: UpdateTipoEvaluacionData) => updateMutation.mutateAsync({ id, data }),
    updateBatch: (periodo_id: string, porcentajes: any) => 
      updateBatchMutation.mutateAsync({ periodo_id, porcentajes }),

    // Loading states
    isCreating: createMutation.isPending,
    isCreatingBatch: createBatchMutation.isPending,
    isUpdating: updateMutation.isPending,
    isUpdatingBatch: updateBatchMutation.isPending,
  };
}