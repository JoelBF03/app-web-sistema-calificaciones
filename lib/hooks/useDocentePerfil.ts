import { useState, useEffect, useCallback } from 'react';
import { docentesService } from '../services/docentes';
import type { CompletarPerfilData, Docente } from '../types/docente.types';
import { toast } from 'sonner';

export function useDocentePerfil() {
  const [docente, setDocente] = useState<Docente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPerfil = useCallback(async () => {
    try {
      const perfil = await docentesService.getMyProfile();
      setDocente(perfil);
    } catch (error) {
      toast.error('Error al cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const actualizarPerfil = useCallback(async (data: Partial<CompletarPerfilData>) => {
    if (!docente) return;
    
    const datosLimpios = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof CompletarPerfilData] = value;
      }
      return acc;
    }, {} as Partial<CompletarPerfilData>);
    
    try {
      const perfilActualizado = await docentesService.completarPerfil(datosLimpios);
      setDocente(perfilActualizado.docente);
      return perfilActualizado;
    } catch (error: any) {
      toast.error('Error al actualizar perfil');
      throw error;
    }
  }, [docente]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  return {
    docente,
    isLoading,
    actualizarPerfil,
    refetch: fetchPerfil,
  };
}