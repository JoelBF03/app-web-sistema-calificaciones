import { useState, useCallback } from 'react';
import { trimestresService } from '../services/periodos';
import { Trimestre } from '../types/periodo.types';
import { toast } from 'sonner';

export function useTrimestres() {
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerTrimestresActivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trimestresService.getTrimestresActivos();
      setTrimestres(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar trimestres';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerTrimestreActivo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trimestre = await trimestresService.getTrimestreActivo();
      return trimestre;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al obtener trimestre activo';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerTrimestresByPeriodo = useCallback(async (periodoId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await trimestresService.getTrimestresByPeriodo(periodoId);
      setTrimestres(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar trimestres';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerTrimestre = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const trimestre = await trimestresService.getById(id);
      return trimestre;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al obtener trimestre';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarTrimestre = useCallback(async (id: string, data: Partial<Trimestre>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await trimestresService.update(id, data);
      const trimestreActualizado = response.trimestre;
      
      setTrimestres(prev =>
        prev.map(t => t.id === id ? trimestreActualizado : t)
      );
      
      toast.success(response.message);
      return trimestreActualizado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar trimestre';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trimestres,
    loading,
    error,
    obtenerTrimestresActivos,
    obtenerTrimestreActivo,
    obtenerTrimestresByPeriodo,
    obtenerTrimestre,
    actualizarTrimestre
  };
}