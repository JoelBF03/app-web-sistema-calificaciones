import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matriculasService } from '../services/matriculas';
import { toast } from 'sonner';
import type {
  CreateMatriculaDto,
  UpdateMatriculaDto,
  ResumenImportacionDto,
  ResultadoImportacionDto,
} from '../types/matricula.types';

export function useMatriculas() {
  const queryClient = useQueryClient();

  const {
    data: matriculas,
    isLoading: loading,
    error,
    refetch: fetchMatriculas
  } = useQuery({
    queryKey: ['matriculas'],
    queryFn: matriculasService.findAll,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const crearMutation = useMutation({
    mutationFn: (data: CreateMatriculaDto) => matriculasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Matrícula creada exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al crear matrícula';
      toast.error(errorMsg);
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatriculaDto }) =>
      matriculasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Matrícula actualizada exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al actualizar matrícula';
      toast.error(errorMsg);
    },
  });

  const retirarMutation = useMutation({
    mutationFn: ({ id, observaciones }: { id: string; observaciones?: string }) =>
      matriculasService.remove(id, observaciones),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Estudiante retirado exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al retirar estudiante';
      toast.error(errorMsg);
    },
  });

  const reactivarMutation = useMutation({
    mutationFn: (id: string) => matriculasService.reactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Estudiante reactivado exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al reactivar estudiante';
      toast.error(errorMsg);
    },
  });

  const confirmarImportacionMutation = useMutation({
    mutationFn: ({ previewId, periodoId }: { previewId: string; periodoId: string }) =>
      matriculasService.confirmarImportacion(previewId, periodoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
      toast.success('Importación completada exitosamente');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Error al confirmar importación';
      toast.error(errorMsg);
    },
  });

  return {
    matriculas: matriculas || [],
    loading,
    error: error?.message || null,

    fetchMatriculas,
    crearMatricula: crearMutation.mutateAsync,
    actualizarMatricula: (id: string, data: UpdateMatriculaDto) =>
      actualizarMutation.mutateAsync({ id, data }),
    retirarEstudiante: (id: string, observaciones?: string) =>
      retirarMutation.mutateAsync({ id, observaciones }),
    reactivarEstudiante: reactivarMutation.mutateAsync,
    confirmarImportacion: (previewId: string, periodoId: string) =>
      confirmarImportacionMutation.mutateAsync({ previewId, periodoId }),

    descargarPlantilla: async () => {
      try {
        const blob = await matriculasService.descargarPlantilla();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'plantilla-matriculas.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error: any) {
        toast.error('Error al descargar plantilla');
        throw error;
      }
    },

    procesarImportacion: async (file: File, periodoId: string): Promise<ResumenImportacionDto> => {
      try {
        return await matriculasService.subirArchivoImportacion(file, periodoId);
      } catch (error: any) {
        toast.error('Error al procesar archivo');
        throw error;
      }
    },
  };
}