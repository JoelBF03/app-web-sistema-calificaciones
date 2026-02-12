import { api } from './api';
import {
  PromedioPeriodo,
  RegistrarSupletorioDto,
  RegistrarSupletorioResponse,
  EstudiantesSupletorioResponse
} from '../types/calificaciones.types';

export const promediosPeriodoService = {
  getAll: async (): Promise<PromedioPeriodo[]> => {
    const response = await api.get('/promedio-periodo');
    return response.data;
  },

  getById: async (id: string): Promise<PromedioPeriodo> => {
    const response = await api.get(`/promedio-periodo/${id}`);
    return response.data;
  },

  getByEstudiante: async (estudianteId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/estudiante/${estudianteId}`);
    return response.data;
  },

  getByMateriaCursoYPeriodo: async (materiaCursoId: string, periodoLectivoId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/materia-curso/${materiaCursoId}/periodo/${periodoLectivoId}`);
    return response.data;
  },

  getByCursoYPeriodo: async (cursoId: string, periodoLectivoId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/curso/${cursoId}/periodo/${periodoLectivoId}`);
    return response.data;
  },

  getEstudiantesEnSupletorio: async (materiaCursoId: string, periodoLectivoId: string): Promise<EstudiantesSupletorioResponse> => {
    const response = await api.get(`/promedio-periodo/supletorio/materia-curso/${materiaCursoId}/periodo/${periodoLectivoId}`);
    return {
      estudiantes: response.data,
      total: response.data.length
    };
  },

  registrarSupletorio: async (id: string, data: RegistrarSupletorioDto): Promise<RegistrarSupletorioResponse> => {
    const response = await api.patch(`/promedio-periodo/${id}/registrar-supletorio`, data);
    return response.data;
  },

  generarPromediosMasivo: async (periodoLectivoId: string): Promise<any> => {
    const response = await api.post(`/promedio-periodo/generar-masivo/${periodoLectivoId}`);
    return response.data;
  },

  getTodosEstudiantesEnSupletorio: async (periodoLectivoId: string): Promise<PromedioPeriodo[]> => {
    const response = await api.get(`/promedio-periodo/periodo/${periodoLectivoId}/todos-supletorios`);
    return response.data;
  },
};