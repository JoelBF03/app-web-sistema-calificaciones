import { useState, useCallback, useEffect } from 'react';
import { materiaService } from '../services/materias';
import { Materia, CreateMateriaDto, UpdateMateriaDto } from '../types/materia.types';
import { toast } from 'sonner';

export function useMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterias = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await materiaService.findAll();
      setMaterias(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar materias';
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const crearMateria = useCallback(async (data: CreateMateriaDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const nuevaMateria = await materiaService.create(data);
      setMaterias(prev => [...prev, nuevaMateria]);
      toast.success('Materia creada exitosamente');
      return nuevaMateria;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear materia';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const actualizarMateria = useCallback(async (id: string, data: UpdateMateriaDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await materiaService.update(id, data);
      setMaterias(prev => prev.map(m => (m.id === id ? response.materia : m)));
      toast.success(response.message);
      return response.materia;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar materia';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cambiarEstadoMateria = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await materiaService.cambiarEstado(id);
      await fetchMaterias();
      toast.success('Estado de materia actualizado');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cambiar estado';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMaterias]);

  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  return {
    materias,
    isLoading,
    loading: isLoading,
    error,
    fetchMaterias,
    crearMateria,
    actualizarMateria,
    cambiarEstadoMateria
  };
}