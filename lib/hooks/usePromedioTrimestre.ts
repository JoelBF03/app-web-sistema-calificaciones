import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promedioTrimestreService } from '../services/promedio-trimestre';
import { toast } from 'sonner';

export function usePromedioTrimestre(materia_curso_id_o_curso_id: string, trimestre_id: string) {
  const queryClient = useQueryClient();
  const esCurso = materia_curso_id_o_curso_id && materia_curso_id_o_curso_id.length > 0;

  const { data: promedios, isLoading, error } = useQuery({
    queryKey: ['promedio-trimestre', materia_curso_id_o_curso_id, trimestre_id],
    queryFn: () => {
      // Intentar primero por curso (para tutoría), si falla usar materia-curso
      return promedioTrimestreService.getByCursoYTrimestre(materia_curso_id_o_curso_id, trimestre_id)
        .catch(() => promedioTrimestreService.getByMateriaCursoYTrimestre(materia_curso_id_o_curso_id, trimestre_id));
    },
    enabled: !!materia_curso_id_o_curso_id && !!trimestre_id,
  });

  const generarMutation = useMutation({
    mutationFn: promedioTrimestreService.generarPromediosMasivo,
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['promedio-trimestre'] });
      toast.success(`✅ Generados: ${resultado.total_generados} | ⚠️ Fallidos: ${resultado.total_fallidos}`);
      
      if (resultado.estudiantes_incompletos.length > 0) {
        console.warn('Estudiantes incompletos:', resultado.estudiantes_incompletos);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al generar promedios');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, observaciones }: { id: string; observaciones: string }) => 
      promedioTrimestreService.update(id, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promedio-trimestre', materia_curso_id_o_curso_id, trimestre_id] });
      toast.success('Observaciones actualizadas');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    },
  });

  const recalcularMutation = useMutation({
    mutationFn: promedioTrimestreService.recalcular,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promedio-trimestre', materia_curso_id_o_curso_id, trimestre_id] });
      toast.success('Promedio recalculado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al recalcular');
    },
  });

  return {
    promedios: promedios || [],
    isLoading,
    error,
    generarPromedios: generarMutation.mutate,
    updateObservaciones: updateMutation.mutate,
    recalcular: recalcularMutation.mutate,
    isGenerando: generarMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRecalculando: recalcularMutation.isPending,
  };
}