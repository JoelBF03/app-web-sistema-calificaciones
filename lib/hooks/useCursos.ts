// lib/hooks/useCursos.ts
import { useState, useCallback, useEffect } from 'react';
import { cursosService } from '../services/cursos';
import { Curso, CursoStats, UpdateCursoDto } from '../types/curso.types';
import { toast } from 'sonner';

export function useCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [stats, setStats] = useState<CursoStats>({
    totalCursos: 0,
    cursosBasica: 0,
    cursosBachillerato: 0,
    cursosActivos: 0,
    cursosInactivos: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCursos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cursosService.findAll();
      setCursos(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar cursos';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await cursosService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error al cargar stats:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [cursosData, statsData] = await Promise.all([
        cursosService.findAll(),
        cursosService.getStats()
      ]);
      setCursos(cursosData);
      setStats(statsData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar datos';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const crearCurso = useCallback(async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cursosService.create(data);
      const nuevoCurso = response.curso;
      setCursos(prev => [...prev, nuevoCurso]);
      toast.success(response.message);
      await fetchStats();
      return nuevoCurso;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear curso';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  const actualizarCurso = useCallback(async (id: string, data: UpdateCursoDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cursosService.update(id, data);
      const cursoActualizado = response.curso;
      setCursos(prev => prev.map(c => (c.id === id ? cursoActualizado : c)));
      toast.success(response.message);
      return cursoActualizado;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar curso';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cambiarEstado = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cursosService.cambiarEstado(id);
      setCursos(prev => prev.map(c => (c.id === id ? { ...c, estado: response.curso.estado_nuevo } : c)));
      toast.success(response.message);
      await fetchStats();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cambiar estado';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats]);

  // 🔥 Auto-cargar al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    cursos,
    stats,
    isLoading,
    loading: isLoading,
    error,
    fetchCursos,
    fetchStats,
    loadData,
    crearCurso,
    actualizarCurso,
    cambiarEstado
  };
}