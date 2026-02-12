import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { estudiantesService } from '../services/estudiantes';
import { toast } from 'sonner';
import type {
  Estudiante,
  CreateEstudianteDto,
  UpdateEstudianteDto,
  EstadoEstudiante
} from '../types/estudiante.types';

interface FiltrosEstudiantes {
  estado?: EstadoEstudiante | '';
  incompletos?: boolean;
  search?: string;
  nivelCurso?: string;
  page?: number;
  limit?: number;
}

export function useEstudiantes(filtrosIniciales?: FiltrosEstudiantes) {
  const queryClient = useQueryClient();

  const {
    data: estadisticas,
    isLoading: loadingEstadisticas,
    refetch: refetchEstadisticas
  } = useQuery({
    queryKey: ['estudiantes', 'estadisticas'],
    queryFn: estudiantesService.getEstadisticas,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const {
    data: estudiantesData,
    isLoading: loadingEstudiantes,
    error,
    refetch: refetchEstudiantes
  } = useQuery({
    queryKey: ['estudiantes', 'list', filtrosIniciales],
    queryFn: () => estudiantesService.getAll(filtrosIniciales || {}),
    enabled: true,
    staleTime: 30 * 1000,
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEstudianteDto }) =>
      estudiantesService.update(id, data),
    onSuccess: (updatedEstudiante) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes', 'estadisticas'] });
      queryClient.setQueryData(['estudiantes', updatedEstudiante.id], updatedEstudiante);
      toast.success('Estudiante actualizado exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al actualizar estudiante';
      toast.error(errorMsg);
    },
  });

  const retirarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      estudiantesService.retirar(id, motivo),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success(response.message);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al retirar estudiante';
      toast.error(errorMsg);
    },
  });

  const graduarMutation = useMutation({
    mutationFn: (id: string) => estudiantesService.graduar(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success(response.message);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al graduar estudiante';
      toast.error(errorMsg);
    },
  });

  const reactivarMutation = useMutation({
    mutationFn: (id: string) => estudiantesService.reactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Estudiante reactivado exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al reactivar estudiante';
      toast.error(errorMsg);
    },
  });

  const crearMutation = useMutation({
    mutationFn: (data: CreateEstudianteDto) => estudiantesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Estudiante creado exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al crear estudiante';
      toast.error(errorMsg);
    },
  });

  return {
    estudiantes: estudiantesData?.data || [],
    estadisticas: estadisticas || {
      activos: 0,
      sinMatricula: 0,
      completos: 0,
      incompletos: 0,
      graduados: 0,
      retirados: 0,
      inactivosTemporales: 0,
    },
    pagination: {
      total: estudiantesData?.total || 0,
      page: estudiantesData?.page || 1,
      lastPage: estudiantesData?.lastPage || 1,
    },

    isLoading: loadingEstudiantes || loadingEstadisticas,
    loading: loadingEstudiantes || loadingEstadisticas,
    error: error?.message || null,

    fetchEstudiantes: refetchEstudiantes,
    fetchEstadisticas: refetchEstadisticas,
    obtenerEstudiante: async (id: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['estudiantes', id],
        queryFn: () => estudiantesService.getById(id),
      });
      return data;
    },

    actualizarEstudiante: (id: string, data: UpdateEstudianteDto) =>
      actualizarMutation.mutateAsync({ id, data }),
    retirarEstudiante: (id: string, motivo?: string) =>
      retirarMutation.mutateAsync({ id, motivo }),
    graduarEstudiante: graduarMutation.mutateAsync,
    reactivarEstudiante: reactivarMutation.mutateAsync,
    crearEstudiante: crearMutation.mutateAsync,
  };
}