import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promediosPeriodoService } from '../services/promedio-periodo';
import { toast } from 'sonner';
import type { RegistrarSupletorioDto } from '../types/calificaciones.types';

export function usePromediosPeriodo() {
  const queryClient = useQueryClient();

  const {
    data: promedios,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['promedios-periodo'],
    queryFn: promediosPeriodoService.getAll,
    staleTime: 2 * 60 * 1000,
  });

  const registrarSupletorioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegistrarSupletorioDto }) =>
      promediosPeriodoService.registrarSupletorio(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['promedios-periodo'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes-supletorio'] });
      toast.success(response.message || 'Nota de supletorio registrada correctamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al registrar supletorio';
      toast.error(errorMsg);
    },
  });

  const generarPromediosMasivoMutation = useMutation({
    mutationFn: (periodoLectivoId: string) =>
      promediosPeriodoService.generarPromediosMasivo(periodoLectivoId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['promedios-periodo'] });
      toast.success(response.message || 'Promedios anuales generados correctamente');

      if (response.total_generados) {
        toast.info(`Se generaron ${response.total_generados} promedios anuales`, {
          duration: 5000
        });
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al generar promedios';
      toast.error(errorMsg);
    },
  });

  return {
    promedios: promedios || [],
    loading,
    error: error?.message || null,

    obtenerPromediosPorEstudiante: async (estudianteId: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['promedios-estudiante', estudianteId],
        queryFn: () => promediosPeriodoService.getByEstudiante(estudianteId),
      });
      return data;
    },
    obtenerPromediosPorCursoYPeriodo: async (cursoId: string, periodoLectivoId: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['promedios-curso-periodo', cursoId, periodoLectivoId],
        queryFn: () => promediosPeriodoService.getByCursoYPeriodo(cursoId, periodoLectivoId),
      });
      return data;
    },

    registrarSupletorio: registrarSupletorioMutation.mutateAsync,
    generarPromediosMasivo: generarPromediosMasivoMutation.mutateAsync,

    isRegistering: registrarSupletorioMutation.isPending,
    isGenerating: generarPromediosMasivoMutation.isPending,
  };
}

export function useEstudiantesSupletorio(materiaCursoId: string, periodoLectivoId: string) {
  const queryClient = useQueryClient();

  const {
    data: estudiantes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['estudiantes-supletorio', materiaCursoId, periodoLectivoId],
    queryFn: async () => {
      const response = await promediosPeriodoService.getEstudiantesEnSupletorio(materiaCursoId, periodoLectivoId);
      return response.estudiantes;
    },
    enabled: !!materiaCursoId && !!periodoLectivoId,
    staleTime: 1 * 60 * 1000,
  });

  const registrarSupletorioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RegistrarSupletorioDto }) =>
      promediosPeriodoService.registrarSupletorio(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['estudiantes-supletorio', materiaCursoId, periodoLectivoId]
      });
      queryClient.invalidateQueries({ queryKey: ['promedios-periodo'] });
      toast.success('Nota de supletorio registrada correctamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al registrar supletorio';
      toast.error(errorMsg);
    },
  });

  return {
    estudiantes,
    total: estudiantes.length,
    isLoading,
    error,
    refetch,
    registrarSupletorio: registrarSupletorioMutation.mutate,
    isRegistering: registrarSupletorioMutation.isPending,
  };
}

export function useTodosEstudiantesSupletorio(periodoLectivoId: string) {
  const {
    data: estudiantes,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['todos-estudiantes-supletorio', periodoLectivoId],
    queryFn: () => promediosPeriodoService.getTodosEstudiantesEnSupletorio(periodoLectivoId),
    enabled: !!periodoLectivoId,
    staleTime: 1 * 60 * 1000,
  });

  return {
    estudiantes: estudiantes || [],
    isLoading,
    error,
    refetch,
  };
}