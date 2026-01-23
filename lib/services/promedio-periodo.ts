import { api } from './api';
import {
  PromedioPeriodo,
  RegistrarSupletorioDto,
  RegistrarSupletorioResponse,
  EstudiantesSupletorioResponse
} from '../types/calificaciones.types';

export const promediosPeriodoService = {
  // Obtener todos los promedios anuales
  getAll: async (): Promise<PromedioPeriodo[]> => {
    const response = await api.get('/promedio-periodo');
    return response.data;
  },

  // Obtener promedio anual específico
  getById: async (id: string): Promise<PromedioPeriodo> => {
    const response = await api.get(`/promedio-periodo/${id}`);
    return response.data;
  },

  // Obtener promedios anuales de un estudiante
  getByEstudiante: async (estudianteId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/estudiante/${estudianteId}`);
    return response.data;
  },

  // Obtener promedios anuales por materia-curso y período
  getByMateriaCursoYPeriodo: async (materiaCursoId: string, periodoLectivoId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/materia-curso/${materiaCursoId}/periodo/${periodoLectivoId}`);
    return response.data;
  },

  // Obtener promedios anuales por curso y período
  getByCursoYPeriodo: async (cursoId: string, periodoLectivoId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/curso/${cursoId}/periodo/${periodoLectivoId}`);
    return response.data;
  },

  // 🎓 DOCENTE: Estudiantes en supletorio de una materia-curso
  getEstudiantesEnSupletorio: async (materiaCursoId: string, periodoLectivoId: string): Promise<EstudiantesSupletorioResponse> => {
    const response = await api.get(`/promedio-periodo/supletorio/materia-curso/${materiaCursoId}/periodo/${periodoLectivoId}`);
    return {
      estudiantes: response.data,
      total: response.data.length
    };
  },

  // 🎓 DOCENTE: Registrar nota de supletorio
  registrarSupletorio: async (id: string, data: RegistrarSupletorioDto): Promise<RegistrarSupletorioResponse> => {
    const response = await api.patch(`/promedio-periodo/${id}/registrar-supletorio`, data);
    return response.data;
  },

  // 👑 ADMIN: Generar promedios anuales masivos
  generarPromediosMasivo: async (periodoLectivoId: string): Promise<any> => {
    const response = await api.post(`/promedio-periodo/generar-masivo/${periodoLectivoId}`);
    return response.data;
  },

  // 👑 ADMIN: Todos los estudiantes en supletorio del período
  getTodosEstudiantesEnSupletorio: async (periodoLectivoId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/periodo/${periodoLectivoId}/todos-supletorios`);
    return response.data;
  },
};