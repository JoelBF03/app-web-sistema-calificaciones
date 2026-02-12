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

  const {
    data: periodoActivo,
    refetch: loadPeriodoActivo
  } = useQuery({
    queryKey: ['periodo-activo'],
    queryFn: periodosService.getPeriodoActivo,
    staleTime: 5 * 60 * 1000,
  });

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
        toast.info(`${response.trimestres_afectados} trimestres actualizados`, { duration: 5000 });
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al actualizar período';
      toast.error(errorMsg);
    },
  });

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

  const activarSupletoriosMutation = useMutation({
    mutationFn: (id: string) => periodosService.activarSupletorios(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-activo'] });
      toast.success(response.message);
      
      if (response.estadisticas) {
        const { 
          total_promedios_anuales,
          estudiantes_en_supletorio,
          estudiantes_aprobados,
          estudiantes_reprobados
        } = response.estadisticas;

        toast.info(
          `Promedios: ${total_promedios_anuales} | En supletorio: ${estudiantes_en_supletorio} | Aprobados: ${estudiantes_aprobados} | Reprobados: ${estudiantes_reprobados}`,
          { duration: 10000 }
        );
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al activar supletorios';
      toast.error(errorMsg);
    },
  });

  const cerrarSupletoriosMutation = useMutation({
    mutationFn: (id: string) => periodosService.cerrarSupletorios(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-activo'] });
      toast.success(response.message);
      
      if (response.advertencia) {
        toast.warning(response.advertencia, { duration: 10000 });
      }

      if (response.estadisticas) {
        const { 
          total_estudiantes_en_supletorio,
          estudiantes_que_rindieron,
          estudiantes_que_aprobaron,
          estudiantes_que_reprobaron
        } = response.estadisticas;

        toast.info(
          `Total en supletorio: ${total_estudiantes_en_supletorio} | Rindieron: ${estudiantes_que_rindieron} | Aprobaron: ${estudiantes_que_aprobaron} | Reprobaron: ${estudiantes_que_reprobaron}`,
          { duration: 10000 }
        );
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al cerrar supletorios';
      toast.error(errorMsg);
    },
  });

  const reabrirSupletoriosMutation = useMutation({
    mutationFn: (id: string) => periodosService.reabrirSupletorios(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['periodos'] });
      queryClient.invalidateQueries({ queryKey: ['periodo-activo'] });
      toast.success(response.message);
      
      if (response.advertencia) {
        toast.warning(response.advertencia, { duration: 8000 });
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al reabrir supletorios';
      toast.error(errorMsg);
    },
  });

  const validarCierreMutation = useMutation({
    mutationFn: (id: string) => periodosService.validarCierre(id),
  });

  return {
    periodos: periodos || [],
    periodoActivo: periodoActivo || null,
    loading,
    error: error?.message || null,

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

    crearPeriodo: crearPeriodoMutation.mutateAsync,
    actualizarPeriodo: (id: string, data: UpdatePeriodoLectivoData) =>
      actualizarPeriodoMutation.mutateAsync({ id, data }),
    cambiarEstadoPeriodo: cambiarEstadoMutation.mutateAsync,
    validarCierre: validarCierreMutation.mutateAsync,
    activarSupletorios: activarSupletoriosMutation.mutateAsync,
    cerrarSupletorios: cerrarSupletoriosMutation.mutateAsync,
    reabrirSupletorios: reabrirSupletoriosMutation.mutateAsync,

    isCreating: crearPeriodoMutation.isPending,
    isUpdating: actualizarPeriodoMutation.isPending,
    isChangingState: cambiarEstadoMutation.isPending,
    isValidating: validarCierreMutation.isPending,
    isActivatingSupletorios: activarSupletoriosMutation.isPending,
    isClosingSupletorios: cerrarSupletoriosMutation.isPending,
    isReopeningSupletorios: reabrirSupletoriosMutation.isPending,
  };
}