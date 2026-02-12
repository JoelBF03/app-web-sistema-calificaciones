import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { insumosService } from '../services/insumos';
import { toast } from 'sonner';

export function useInsumos(materia_curso_id?: string, trimestre_id?: string) {
  const queryClient = useQueryClient();

  const { data: insumos, isLoading, error, refetch } = useQuery({
    queryKey: ['insumos', materia_curso_id, trimestre_id],
    queryFn: () => insumosService.getByMateriaCursoYTrimestre(materia_curso_id!, trimestre_id!),
    enabled: !!materia_curso_id && !!trimestre_id,
  });

  const createMutation = useMutation({
    mutationFn: insumosService.create,
    onSuccess: () => {
      if (materia_curso_id && trimestre_id) {
        queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      }
      toast.success('Insumo creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear insumo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { nombre?: string } }) => 
      insumosService.update(id, data),
    onSuccess: () => {
      if (materia_curso_id && trimestre_id) {
        queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      }
      toast.success('Insumo actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar insumo');
    },
  });

  const publicarMutation = useMutation({
    mutationFn: insumosService.publicar,
    onSuccess: () => {
      if (materia_curso_id && trimestre_id) {
        queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      toast.success('Insumo publicado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al publicar insumo');
    },
  });

  const reactivarMutation = useMutation({
    mutationFn: insumosService.reactivar,
    onSuccess: () => {
      if (materia_curso_id && trimestre_id) {
        queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      }
      toast.success('Insumo reactivado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al reactivar insumo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: insumosService.delete,
    onSuccess: () => {
      if (materia_curso_id && trimestre_id) {
        queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['calificaciones-insumo'] });
      toast.success('Insumo eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar insumo');
    },
  });

  const findOneMutation = useMutation({
    mutationFn: insumosService.findOne,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cargar insumo');
    },
  });

  return {
    insumos: insumos || [],
    isLoading,
    error,
    refetch,
    createInsumo: createMutation.mutate,
    updateInsumo: updateMutation.mutate,
    publicarInsumo: publicarMutation.mutate,
    reactivarInsumo: reactivarMutation.mutate,
    deleteInsumo: deleteMutation.mutate,
    obtenerInsumo: findOneMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isPublicando: publicarMutation.isPending,
    isReactivando: reactivarMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoadingOne: findOneMutation.isPending,
  };
}