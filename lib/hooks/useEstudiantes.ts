
import { useState, useCallback, useEffect } from 'react';
import { estudiantesService } from '../services/estudiantes';
import type {
  Estudiante,
  EstudiantesResponse,
  CreateEstudianteDto,
  UpdateEstudianteDto,
  EstadoEstudiante,
  EstadisticasEstudiantes
} from '../types/estudiante.types';
import { toast } from 'sonner';

interface UseFiltrosEstudiantes {
  estado: EstadoEstudiante | '';
  incompletos: boolean | undefined;
  search: string;
  nivelCurso?: string;
  periodoId?: string;
  page: number;
  limit: number;
}

export function useEstudiantes() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasEstudiantes>({
    activos: 0,
    sinMatricula: 0,
    completos: 0,
    incompletos: 0,
    graduados: 0,
    retirados: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    lastPage: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estadísticas
  const fetchEstadisticas = useCallback(async () => {
    try {
      const stats = await estudiantesService.getEstadisticas();
      setEstadisticas(stats);
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);

  // Cargar estudiantes con filtros
  // Cargar estudiantes con filtros
  const fetchEstudiantes = useCallback(async (filtros?: Partial<UseFiltrosEstudiantes>) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        estado: filtros?.estado !== undefined ? filtros.estado : 'ACTIVO' as EstadoEstudiante,
        incompletos: filtros?.incompletos,
        search: filtros?.search || '',
        page: filtros?.page || 1,
        limit: filtros?.limit || 20,
      };

      // ✅ AGREGAR: Pasar nivelCurso y periodoId si existen
      if ((filtros as any)?.nivelCurso) {
        params.nivelCurso = (filtros as any).nivelCurso;
      }

      if ((filtros as any)?.periodoId) {
        params.periodoId = (filtros as any).periodoId;
      }

      console.log('🚀 Enviando params al servicio:', params);  // Debug temporal

      const response = await estudiantesService.getAll(params);
      setEstudiantes(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        lastPage: response.lastPage,
      });
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar estudiantes';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener estudiante por ID
  const obtenerEstudiante = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const estudiante = await estudiantesService.getById(id);
      return estudiante;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al obtener estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Crear estudiante
  const crearEstudiante = useCallback(async (data: CreateEstudianteDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const estudiante = await estudiantesService.create(data);
      toast.success('Estudiante creado exitosamente');
      return estudiante;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar estudiante
  const actualizarEstudiante = useCallback(async (id: string, data: UpdateEstudianteDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const estudianteActualizado = await estudiantesService.update(id, data);
      setEstudiantes(prev => prev.map(e => (e.id === id ? estudianteActualizado : e)));
      toast.success('Estudiante actualizado exitosamente');
      return estudianteActualizado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Retirar estudiante
  const retirarEstudiante = useCallback(async (id: string, motivo?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await estudiantesService.retirar(id, motivo);
      setEstudiantes(prev => prev.map(e => (e.id === id ? response.estudiante : e)));
      toast.success(response.message);
      return response.estudiante;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al retirar estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Graduar estudiante
  const graduarEstudiante = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await estudiantesService.graduar(id);
      setEstudiantes(prev => prev.map(e => (e.id === id ? response.estudiante : e)));
      toast.success(response.message);
      return response.estudiante;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al graduar estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reactivar estudiante
  const reactivarEstudiante = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const estudianteReactivado = await estudiantesService.reactivar(id);
      setEstudiantes(prev => prev.map(e => (e.id === id ? estudianteReactivado : e)));
      toast.success('Estudiante reactivado exitosamente');
      return estudianteReactivado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al reactivar estudiante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar estadísticas al montar
  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  return {
    estudiantes,
    estadisticas,
    pagination,
    isLoading,
    loading: isLoading,
    error,
    fetchEstudiantes,
    fetchEstadisticas,
    obtenerEstudiante,
    crearEstudiante,
    actualizarEstudiante,
    retirarEstudiante,
    graduarEstudiante,
    reactivarEstudiante,
  };
}