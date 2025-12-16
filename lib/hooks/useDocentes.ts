// lib/hooks/useDocentes.ts
import { useState, useCallback, useEffect } from 'react';
import { docentesService } from '../services/docentes';
import type { Docente } from '../types/docente.types';
import { toast } from 'sonner';

export function useDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocentes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await docentesService.getAll();
      setDocentes(data);
      return data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar docentes';
      setError(errorMsg);
      toast.error(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerDocente = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const docente = await docentesService.getById(id);
      return docente;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al obtener docente';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const crearDocente = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await docentesService.create(data);
      await fetchDocentes();
      toast.success('Docente creado exitosamente');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear docente';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchDocentes]);

  const actualizarDocente = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await docentesService.update(id, data);
      const docenteActualizado = response.docente;
      setDocentes(prev => prev.map(d => (d.id === id ? docenteActualizado : d)));
      toast.success('Docente actualizado exitosamente');
      return docenteActualizado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar docente';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  return {
    docentes,
    isLoading,
    loading: isLoading,
    error,
    fetchDocentes,
    obtenerDocente,
    crearDocente,
    actualizarDocente,
  };
}