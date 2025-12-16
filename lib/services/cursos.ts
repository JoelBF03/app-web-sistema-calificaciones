import { api } from './api';
import { Curso, CreateCursoDto, UpdateCursoDto, CursoStats, NivelCurso, EstadoCurso } from '@/lib/types/curso.types';

export const cursosService = {
  // 📚 CRUD BÁSICO
  findAll: async (): Promise<Curso[]> => {
    const response = await api.get('/cursos');
    return response.data;
  },

  findByPeriodo: async (periodoId: string): Promise<Curso[]> => {
    const response = await api.get(`/cursos/periodo/${periodoId}`);
    return response.data;
  },

  findByNivel: async (nivelUrl: string): Promise<Curso[]> => {
    const response = await api.get(`/cursos/nivel/${nivelUrl}`);
    return response.data;
  },

  findOne: async (id: string): Promise<Curso> => {
    const response = await api.get(`/cursos/${id}`);
    return response.data;
  },

  create: async (data: CreateCursoDto): Promise<{ message: string; curso: Curso }> => {
    const response = await api.post('/cursos', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCursoDto): Promise<{ message: string; curso: Curso }> => {
    const response = await api.put(`/cursos/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id: string): Promise<{ message: string; curso: any }> => {
    const response = await api.patch(`/cursos/${id}/cambiar-estado`);
    return response.data;
  },

  // 📊 ESTADÍSTICAS (calculadas en el frontend)
  getStats: async (): Promise<CursoStats> => {
    const cursos = await cursosService.findAll();
    
    const cursosBasica = cursos.filter(c => 
      [NivelCurso.OCTAVO, NivelCurso.NOVENO, NivelCurso.DECIMO].includes(c.nivel)
    ).length;
    
    const cursosBachillerato = cursos.filter(c => 
      [NivelCurso.PRIMERO_BACHILLERATO, NivelCurso.SEGUNDO_BACHILLERATO, NivelCurso.TERCERO_BACHILLERATO].includes(c.nivel)
    ).length;

    return {
      totalCursos: cursos.length,
      cursosBasica,
      cursosBachillerato,
      cursosActivos: cursos.filter(c => c.estado === EstadoCurso.ACTIVO).length,
      cursosInactivos: cursos.filter(c => c.estado === EstadoCurso.INACTIVO).length,
    };
  },
};