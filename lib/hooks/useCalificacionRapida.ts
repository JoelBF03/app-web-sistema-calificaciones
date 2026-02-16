import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CalificacionComponente } from '@/lib/types/calificaciones.types';

const SIN_CALIFICAR = '__SIN_CALIFICAR__';

interface UseCalificacionRapidaProps {
  notasOriginales: Record<string, Record<string, CalificacionComponente | null>>;
  setNotasTemp: React.Dispatch<React.SetStateAction<Record<string, Record<string, CalificacionComponente | null>>>>;
  setCambiosPendientes: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useCalificacionRapida({
  notasOriginales,
  setNotasTemp,
  setCambiosPendientes,
}: UseCalificacionRapidaProps) {
  const [componenteSeleccionado, setComponenteSeleccionado] = useState<string>('');
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState<string>('');
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<Set<string>>(new Set());

  const toggleEstudiante = useCallback((estudianteId: string) => {
    setEstudiantesSeleccionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(estudianteId)) {
        newSet.delete(estudianteId);
      } else {
        newSet.add(estudianteId);
      }
      return newSet;
    });
  }, []);

  const toggleTodos = useCallback((estudiantes: Array<{ id: string }>) => {
    setEstudiantesSeleccionados(prev => {
      if (prev.size === estudiantes.length) {
        return new Set();
      } else {
        return new Set(estudiantes.map(e => e.id));
      }
    });
  }, []);

  const aplicarCalificacion = useCallback(() => {
    if (!componenteSeleccionado || !calificacionSeleccionada) {
      toast.error('Selecciona un componente y una calificación');
      return;
    }

    if (estudiantesSeleccionados.size === 0) {
      toast.error('Selecciona al menos un estudiante');
      return;
    }

    const nuevaCalificacion = calificacionSeleccionada === SIN_CALIFICAR 
      ? null 
      : (calificacionSeleccionada as CalificacionComponente);

    estudiantesSeleccionados.forEach(estudianteId => {
      const calificacionOriginal = notasOriginales[estudianteId]?.[componenteSeleccionado] ?? null;

      setNotasTemp((prev) => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [componenteSeleccionado]: nuevaCalificacion,
        },
      }));

      const key = `${estudianteId}:${componenteSeleccionado}`;
      setCambiosPendientes((prev) => {
        const newSet = new Set(prev);

        if (nuevaCalificacion !== calificacionOriginal) {
          newSet.add(key);
        } else {
          newSet.delete(key);
        }

        return newSet;
      });
    });

    toast.success(`Calificación aplicada a ${estudiantesSeleccionados.size} estudiante(s)`);
    setEstudiantesSeleccionados(new Set());
  }, [
    componenteSeleccionado,
    calificacionSeleccionada,
    estudiantesSeleccionados,
    notasOriginales,
    setNotasTemp,
    setCambiosPendientes,
  ]);

  const resetSelecciones = useCallback(() => {
    setEstudiantesSeleccionados(new Set());
    setComponenteSeleccionado('');
    setCalificacionSeleccionada('');
  }, []);

  return {
    componenteSeleccionado,
    calificacionSeleccionada,
    estudiantesSeleccionados,
    setComponenteSeleccionado,
    setCalificacionSeleccionada,
    toggleEstudiante,
    toggleTodos,
    aplicarCalificacion,
    resetSelecciones,
  };
}