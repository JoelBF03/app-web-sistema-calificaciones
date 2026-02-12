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
    const response = await api.get('/estudiantes/estadisticas');
    return response.data;
  },

  getAll: async (params?: {
    estado?: EstadoEstudiante | '';
    incompletos?: boolean;
    search?: string;
    nivelCurso?: string;
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

  updateDatosPersonales: async (id: string, data: any): Promise<Estudiante> => {
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