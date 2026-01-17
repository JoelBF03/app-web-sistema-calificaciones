// nextjs-frontend/lib/hooks/useTrimestres.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trimestresService } from '../services/periodos';
import { toast } from 'sonner';
import type { Trimestre, UpdateTrimestreData, UpdateTrimestreResponse } from '../types/periodo.types';

export function useTrimestres(periodoId?: string) {
  const queryClient = useQueryClient();

  // 📋 Query: Trimestres por período
  const {
    data: trimestres,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['trimestres', periodoId],
    queryFn: () => periodoId
      ? trimestresService.getTrimestresByPeriodo(periodoId)
      : trimestresService.getTrimestresActivos(),
    enabled: !!periodoId,
    staleTime: 2 * 60 * 1000,
  });

  // 📋 Query: Trimestre activo
  const {
    data: trimestreActivo,
    refetch: refetchActivo
  } = useQuery({
    queryKey: ['trimestre-activo'],
    queryFn: trimestresService.getTrimestreActivo,
    staleTime: 5 * 60 * 1000,
  });

  // ✏️ Mutation: Actualizar trimestre
  const actualizarTrimestreMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrimestreData }) =>
      trimestresService.update(id, data),
    onSuccess: (response: UpdateTrimestreResponse) => {
      queryClient.invalidateQueries({ queryKey: ['trimestres'] });
      queryClient.invalidateQueries({ queryKey: ['trimestre-activo'] });
      queryClient.invalidateQueries({ queryKey: ['periodos'] });

      // 🔥 Mostrar mensaje principal
      toast.success(response.message);

      // 🔥 Mostrar información de rollback si existe
      if (response.rollback) {
        const { insumos_reabiertos, promedios_trimestre_eliminados, promedios_anuales_eliminados } = response.rollback;

        if (insumos_reabiertos > 0) {
          toast.info(`📂 ${insumos_reabiertos} insumos reabiertos`, { duration: 5000 });
        }

        if (promedios_trimestre_eliminados > 0) {
          toast.info(`🗑️ ${promedios_trimestre_eliminados} promedios trimestrales eliminados`, { duration: 5000 });
        }

        if (promedios_anuales_eliminados > 0) {
          toast.warning(`⚠️ ${promedios_anuales_eliminados} promedios anuales eliminados`, { duration: 7000 });
        }
      }

      // 🔥 Mostrar advertencia si existe
      if (response.advertencia) {
        toast.warning(response.advertencia, {
          duration: 10000,
          style: { maxWidth: '600px' }
        });
      }

      // 🔥 Mostrar información de promedios generados
      if (response.promedios_trimestre) {
        const { generados, fallidos } = response.promedios_trimestre;

        if (generados > 0) {
          toast.success(`✅ ${generados} promedios trimestrales generados`, { duration: 5000 });
        }

        if (fallidos > 0) {
          toast.warning(`⚠️ ${fallidos} promedios con errores`, { duration: 7000 });
        }
      }

      if (response.promedios_anuales) {
        const { generados, fallidos } = response.promedios_anuales;

        if (generados > 0) {
          toast.success(`✅ ${generados} promedios anuales generados`, { duration: 5000 });
        }

        if (fallidos > 0) {
          toast.warning(`⚠️ ${fallidos} promedios anuales con errores`, { duration: 7000 });
        }
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;

      if (errorData?.errores && Array.isArray(errorData.errores)) {
        // Mostrar mensaje principal
        toast.error(errorData.message || 'No se puede finalizar el trimestre', { duration: 8000 });

        // Mostrar cada error específico
        errorData.errores.forEach((err: any, index: number) => {
          let mensaje = '';

          switch (err.tipo) {
            case 'INSUMO_SIN_PUBLICAR':
              mensaje = `📝 ${err.materia_curso}: ${err.cantidad} insumo(s) sin publicar - Docente: ${err.docente}`;
              break;
            case 'ESTUDIANTE_SIN_EXAMEN':
              mensaje = `🧪 ${err.materia_curso}: ${err.cantidad} estudiante(s) sin examen`;
              break;
            case 'ESTUDIANTE_SIN_PROYECTO':
              mensaje = `🎯 ${err.curso}: ${err.cantidad} estudiante(s) sin proyecto integrador`;
              break;
            default:
              mensaje = JSON.stringify(err);
          }

          toast.error(mensaje, {
            duration: 10000,
            style: { maxWidth: '700px' }
          });
        });

        // Mostrar estadísticas si existen
        if (errorData.estadisticas) {
          const stats = errorData.estadisticas;
          toast.info(
            `📊 Estadísticas: ${stats.estudiantes_completos}/${stats.total_estudiantes} estudiantes completos (${stats.porcentaje_completado})`,
            { duration: 8000 }
          );
        }
      } else {
        // Error genérico
        const errorMsg = errorData?.message || 'Error al actualizar trimestre';
        toast.error(errorMsg);
      }
    },
  });

  // ✅ Mutation: Validar cierre
  const validarCierreMutation = useMutation({
    mutationFn: (id: string) => trimestresService.validarCierre(id),
  });

  return {
    // Data
    trimestres: trimestres || [],
    trimestreActivo: trimestreActivo || null,
    loading,
    error: error?.message || null,

    // Queries
    obtenerTrimestresActivos: async () => {
      const data = await queryClient.fetchQuery({
        queryKey: ['trimestres-activos'],
        queryFn: trimestresService.getTrimestresActivos,
      });
      return data;
    },
    obtenerTrimestreActivo: async () => {
      const data = await queryClient.fetchQuery({
        queryKey: ['trimestre-activo'],
        queryFn: trimestresService.getTrimestreActivo,
      });
      return data;
    },
    obtenerTrimestresByPeriodo: async (id: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['trimestres', id],
        queryFn: () => trimestresService.getTrimestresByPeriodo(id),
      });
      return data;
    },
    obtenerTrimestre: async (id: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: ['trimestre', id],
        queryFn: () => trimestresService.getById(id),
      });
      return data;
    },
    refetch,
    refetchActivo,

    // Mutations
    actualizarTrimestre: (id: string, data: UpdateTrimestreData) =>
      actualizarTrimestreMutation.mutateAsync({ id, data }),
    validarCierre: validarCierreMutation.mutateAsync,

    // Loading states
    isUpdating: actualizarTrimestreMutation.isPending,
    isValidating: validarCierreMutation.isPending,
  };
}