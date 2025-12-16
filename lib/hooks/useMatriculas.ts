import { useState, useCallback } from 'react';
import { matriculasService } from '../services/matriculas';
import type {
  Matricula,
  CreateMatriculaDto,
  ResumenImportacionDto,
  ResultadoImportacionDto,
  RegistroImportacionDto,
  UpdateMatriculaDto
} from '../types/matricula.types';

export function useMatriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatriculas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await matriculasService.findAll();
      setMatriculas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar matrículas');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearMatricula = useCallback(async (data: CreateMatriculaDto) => {
    setLoading(true);
    setError(null);
    try {
      const nuevaMatricula = await matriculasService.create(data);
      setMatriculas(prev => [...prev, nuevaMatricula]);
      return nuevaMatricula;
    } catch (err: any) {
      setError(err.message || 'Error al crear matrícula');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarMatricula = useCallback( async (id: string, data: UpdateMatriculaDto) => {
    setLoading(true);
    setError(null);
    try {
      const actualizada = await matriculasService.update(id, data);
      setMatriculas(prev =>
        prev.map(m => (m.id === id ? actualizada : m))
      );
      return actualizada;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar matrícula');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const descargarPlantilla = useCallback(async () => {
    try {
      const blob = await matriculasService.descargarPlantilla();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla-matriculas.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al descargar plantilla');
      throw err;
    }
  }, []);

  const procesarImportacion = useCallback(
    async (file: File, periodoId: string): Promise<ResumenImportacionDto> => {
      setLoading(true);
      setError(null);
      try {
        return await matriculasService.subirArchivoImportacion(file, periodoId);
      } catch (err: any) {
        setError(err.message || 'Error al procesar archivo');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const confirmarImportacion = useCallback(
    async (
      previewId: string,
      periodoId: string
    ): Promise<ResultadoImportacionDto> => {
      setLoading(true);
      setError(null);
      try {
        const resultado = await matriculasService.confirmarImportacion(
          previewId,
          periodoId
        );
        await fetchMatriculas();
        return resultado;
      } catch (err: any) {
        setError(err.message || 'Error al confirmar importación');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMatriculas]
  );

  const retirarEstudiante = useCallback(
    async (id: string, observaciones?: string) => {
      setLoading(true);
      setError(null);
      try {
        const actualizada = await matriculasService.remove(id, observaciones ?? undefined);
        setMatriculas(prev =>
          prev.map(m => (m.id === id ? actualizada : m))
        );
        return actualizada;
      } catch (err: any) {
        setError(err.message || 'Error al retirar estudiante');
        throw err;
      } finally {
        setLoading(false);
      }
    }, []
  );

  const reactivarEstudiante = useCallback(
    async (id: string) => {
      try {
        const reactivada = await matriculasService.reactivar(id);
        setMatriculas(prev => prev.map(m => m.id === id ? reactivada : m));
        return reactivada;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Error al reactivar estudiante';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    }, []
  );
  return {
    matriculas,
    loading,
    error,
    fetchMatriculas,
    crearMatricula,
    actualizarMatricula,
    descargarPlantilla,
    procesarImportacion,
    confirmarImportacion,
    retirarEstudiante,
    reactivarEstudiante
  };
}