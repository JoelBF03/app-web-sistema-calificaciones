import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { periodosService } from '../services/periodos';
import { toast } from 'sonner';
import type { 
  PeriodoLectivo, 
  CreatePeriodoLectivoData, 
  UpdatePeriodoLectivoData 
} from '../types/periodo.types';

export function usePeriodos() {
  const queryClient = useQueryClient();

  // Query: Obtener todos los períodos
  const {
    data: periodos,
    isLoading: loading,
    error,
    refetch: fetchPeriodos
  } = useQuery({
    queryKey: ['periodos'],
    queryFn: periodosService.getAll,
    staleTime: 2 * 60 * 1000,
  });

  // Query: Período activo
  const {
    data: periodoActivo,
    refetch: loadPeriodoActivo
  } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: periodosService.getPeriodoActivo,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: Crear período
  const crearPeriodoMutation = useMutation({
    mutationFn: (data: CreatePeriodoLectivoData) => periodosService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-activo'] });
      toast.success(`${response.message} - Se crearon ${response.trimestres.length} trimestres`);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al crear período';
      toast.error(errorMsg);
    },
  });

  // Mutation: Actualizar nombres y fechas del período
  const actualizarPeriodoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePeriodoLectivoData }) =>
      periodosService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-activo'] });
      toast.success(response.message);
      
      if (response.advertencia) {
        toast.warning(response.advertencia, { duration: 8000 });
      }
      
      if (response.trimestres_afectados && response.trimestres_afectados > 0) {
        toast.info(`📅 ${response.trimestres_afectados} trimestres actualizados`, { duration: 5000 });
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al actualizar período';
      toast.error(errorMsg);
    },
  });

  // Mutation: Cambiar estado ACTIVO → FINALIZADO
  const cambiarEstadoMutation = useMutation({
    mutationFn: (id: string) => periodosService.cambiarEstado(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-activo'] });
      toast.success(response.message);
      
      if (response.advertencia) {
        toast.warning(response.advertencia, { duration: 10000 });
      }

      if (response.estadisticas) {
        const { 
          estudiantes_graduados, 
          estudiantes_sin_matricula, 
          matriculas_finalizadas,
          cursos_inactivados,
          materias_curso_inactivadas
        } = response.estadisticas;

        toast.info(
          `Estadísticas: ${estudiantes_graduados} graduados, ${estudiantes_sin_matricula} sin matrícula, ${matriculas_finalizadas} matrículas finalizadas, ${cursos_inactivados} cursos inactivados, ${materias_curso_inactivadas} asignaciones inactivadas`,
          { duration: 10000 }
        );
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al cambiar estado';
      toast.error(errorMsg);
    },
  });

  // Mutation: Validar cierre
  const validarCierreMutation = useMutation({
    mutationFn: (id: string) => periodosService.validarCierre(id),
  });

  return {
    // Data
    periodos: periodos || [],
    periodoActivo: periodoActivo || null,
    loading,
    error: error?.message || null,

    // Queries
    fetchPeriodos,
    loadPeriodoActivo,
    obtenerPeriodoActivo: async () => {
      const data = await queryClient.fetchQuery({
        queryKey: ['periodo-activo'],
        queryFn: periodosService.getPeriodoActivo,
      });
      return data;
    },
    obtenerPeriodo: async (id: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['periodo', id],
        queryFn: () => periodosService.getById(id),
      });
      return data;
    },

    // Mutations
    crearPeriodo: crearPeriodoMutation.mutateAsync,
    actualizarPeriodo: (id: string, data: UpdatePeriodoLectivoData) =>
      actualizarPeriodoMutation.mutateAsync({ id, data }),
    cambiarEstadoPeriodo: cambiarEstadoMutation.mutateAsync,
    validarCierre: validarCierreMutation.mutateAsync,

    // Loading states
    isCreating: crearPeriodoMutation.isPending,
    isUpdating: actualizarPeriodoMutation.isPending,
    isChangingState: cambiarEstadoMutation.isPending,
    isValidating: validarCierreMutation.isPending,
  };
}