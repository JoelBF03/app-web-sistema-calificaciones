import { api } from './api';

import type { 
  Estudiante, 
  EstudiantesResponse, 
  CreateEstudianteDto, 
  UpdateEstudianteDto,
  EstadoEstudiante,
  EstadisticasEstudiantes
} from '../types/estudiante.types';

export const estudiantesService = {

  getEstadisticas: async (): Promise<EstadisticasEstudiantes> => {
    try {
      const [activos, sinMatricula, completos, incompletos, graduados, retirados] = await Promise.all([
        api.get('/estudiantes', { params: { estado: 'ACTIVO', limit: 1 } }),
        api.get('/estudiantes', { params: { estado: 'SIN_MATRICULA', limit: 1 } }),
        api.get('/estudiantes', { params: { incompletos: 'false', limit: 1 } }),
        api.get('/estudiantes', { params: { incompletos: 'true', limit: 1 } }),
        api.get('/estudiantes', { params: { estado: 'GRADUADO', limit: 1 } }),
        api.get('/estudiantes', { params: { estado: 'RETIRADO', limit: 1 } }),
      ]);

      return {
        activos: activos.data.total || 0,
        sinMatricula: sinMatricula.data.total || 0,
        completos: completos.data.total || 0,
        incompletos: incompletos.data.total || 0,
        graduados: graduados.data.total || 0,
        retirados: retirados.data.total || 0,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        activos: 0,
        sinMatricula: 0,
        completos: 0,
        incompletos: 0,
        graduados: 0,
        retirados: 0,
      };
    }
  },

  getAll: async (params?: {
    estado?: EstadoEstudiante | '';
    incompletos?: boolean;
    search?: string;
    nivelCurso?: string;
    periodoId?: string;
    page?: number;
    limit?: number;
  }): Promise<EstudiantesResponse> => {
    const response = await api.get('/estudiantes', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Estudiante> => {
    const response = await api.get(`/estudiantes/${id}`);
    return response.data;
  },

  create: async (data: CreateEstudianteDto): Promise<Estudiante> => {
    const response = await api.post('/estudiantes', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEstudianteDto): Promise<Estudiante> => {
    const response = await api.put(`/estudiantes/${id}`, data);
    return response.data;
  },

  async updateDatosPersonales(id: string, data: any): Promise<Estudiante> {
    const response = await api.put(`/estudiantes/${id}/datos-personales`, data);
    return response.data;
  },

  retirar: async (id: string, motivo?: string): Promise<{ message: string; estudiante: Estudiante }> => {
    const response = await api.patch(`/estudiantes/${id}/retirar`, { motivo });
    return response.data;
  },

  graduar: async (id: string): Promise<{ message: string; estudiante: Estudiante }> => {
    const response = await api.patch(`/estudiantes/${id}/graduar`);
    return response.data;
  },

  reactivar: async (id: string): Promise<Estudiante> => {
    const response = await api.patch(`/estudiantes/${id}/reactivar`);
    return response.data;
  },

  getIncompletos: async (page = 1, limit = 20): Promise<EstudiantesResponse> => {
    const response = await api.get('/estudiantes/incompletos', {
      params: { page, limit }
    });
    return response.data;
  },
};