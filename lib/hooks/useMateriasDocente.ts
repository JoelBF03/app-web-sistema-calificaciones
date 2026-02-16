import { useState, useCallback, useEffect } from 'react';
import { materiaCursoService } from '../services/materia-curso';
import { cursosService } from '../services/cursos';
import { docentesService } from '../services/docentes';
import type { MateriaCurso } from '../types/materia-curso.types';
import type { Curso } from '../types/curso.types';
import type { Docente } from '../types/docente.types';
import { TipoCalificacion } from '../types/materia.types';
import { toast } from 'sonner';

export function useMateriasDocente() {
  const [materiasAsignadas, setMateriasAsignadas] = useState<MateriaCurso[]>([]);
  const [cursoTutor, setCursoTutor] = useState<Curso | null>(null);
  const [docente, setDocente] = useState<Docente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const myProfile = await docentesService.getMyProfile();
      
      if (!myProfile || !myProfile.id) {
        throw new Error('No se pudo obtener el perfil del docente. Por favor, contacta al administrador.');
      }
      
      setDocente(myProfile);
      const docenteId = myProfile.id;

      const materiasResponse = await materiaCursoService.getByDocente(docenteId);
      
      // ✅ Si periodo es null, significa que no hay período activo (no es un error)
      if (materiasResponse.periodo === null) {
        setMateriasAsignadas([]);
        setCursoTutor(null);
        setIsLoading(false);
        return; // Salir sin mostrar error
      }
      
      const materiasCuantitativas = (materiasResponse.materias || []).filter(
        (mc) => mc.materia.tipoCalificacion !== TipoCalificacion.CUALITATIVA
      );
      
      setMateriasAsignadas(materiasCuantitativas);

      const cursosData = await cursosService.findAll();
      const cursoComoTutor = cursosData.find(curso => curso.docente_id === docenteId);
      setCursoTutor(cursoComoTutor || null);

    } catch (err: any) {
      let errorMsg = 'Error al cargar datos';
      
      if (err.response?.status === 404) {
        errorMsg = 'No se encontró tu perfil de docente. Por favor, contacta al administrador para que complete tu registro.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    materiasAsignadas,
    cursoTutor,
    docente,
    isLoading,
    error,
    refetch: fetchData,
  };
}