import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { insumosService } from '../services/insumos';
import { calificacionInsumoService } from '../services/calificacion-insumo';
import { toast } from 'sonner';

export function useInsumos(materia_curso_id: string, trimestre_id: string) {
  const queryClient = useQueryClient();
  const [calificacionesPorInsumo, setCalificacionesPorInsumo] = useState<Record<string, any[]>>({});

  const { data: insumos, isLoading, error } = useQuery({
    queryKey: ['insumos', materia_curso_id, trimestre_id],
    queryFn: () => insumosService.getByMateriaCursoYTrimestre(materia_curso_id, trimestre_id),
    enabled: !!materia_curso_id && !!trimestre_id,
  });

  useEffect(() => {
    const cargarCalificaciones = async () => {
      if (!insumos || insumos.length === 0) return;

      for (const insumo of insumos) {
        try {
          const cals = await calificacionInsumoService.getByInsumo(insumo.id);
          setCalificacionesPorInsumo(prev => ({ ...prev, [insumo.id]: cals }));
        } catch (error) {
          console.error(`Error cargando calificaciones del insumo ${insumo.id}:`, error);
        }
      }
    };

    cargarCalificaciones();
  }, [insumos]);

  const createMutation = useMutation({
    mutationFn: insumosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
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
      queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      toast.success('Insumo actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar insumo');
    },
  });

  const publicarMutation = useMutation({
    mutationFn: insumosService.publicar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      toast.success('Insumo publicado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al publicar insumo');
    },
  });

  const reactivarMutation = useMutation({
    mutationFn: insumosService.reactivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      toast.success('Insumo reactivado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al reactivar insumo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: insumosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos', materia_curso_id, trimestre_id] });
      toast.success('Insumo eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar insumo');
    },
  });

  return {
    insumos: insumos || [],
    calificacionesPorInsumo,
    isLoading,
    error,
    createInsumo: createMutation.mutate,
    updateInsumo: updateMutation.mutate,
    publicarInsumo: publicarMutation.mutate,
    reactivarInsumo: reactivarMutation.mutate,
    deleteInsumo: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isPublicando: publicarMutation.isPending,
    isReactivando: reactivarMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}