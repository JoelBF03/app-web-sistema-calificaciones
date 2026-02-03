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

  // 📊 Estadísticas optimizadas (1 solo request)
  getEstadisticas: async (): Promise<EstadisticasEstudiantes> => {
    const response = await api.get('/estudiantes/estadisticas');
    return response.data;
  },

  // 📋 Listar con filtros (sin periodoId)
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

  // 👤 Obtener por ID
  getById: async (id: string): Promise<Estudiante> => {
    const response = await api.get(`/estudiantes/${id}`);
    return response.data;
  },

  // ➕ Crear
  create: async (data: CreateEstudianteDto): Promise<Estudiante> => {
    const response = await api.post('/estudiantes', data);
    return response.data;
  },

  // ✏️ Actualizar
  update: async (id: string, data: UpdateEstudianteDto): Promise<Estudiante> => {
    const response = await api.put(`/estudiantes/${id}`, data);
    return response.data;
  },

  // ✏️ Actualizar datos personales (tutor)
  updateDatosPersonales: async (id: string, data: any): Promise<Estudiante> => {
    const response = await api.put(`/estudiantes/${id}/datos-personales`, data);
    return response.data;
  },

  // ❌ Retirar
  retirar: async (id: string, motivo?: string): Promise<{ message: string; estudiante: Estudiante }> => {
    const response = await api.patch(`/estudiantes/${id}/retirar`, { motivo });
    return response.data;
  },

  // 🎓 Graduar
  graduar: async (id: string): Promise<{ message: string; estudiante: Estudiante }> => {
    const response = await api.patch(`/estudiantes/${id}/graduar`);
    return response.data;
  },

  // 🔄 Reactivar
  reactivar: async (id: string): Promise<Estudiante> => {
    const response = await api.patch(`/estudiantes/${id}/reactivar`);
    return response.data;
  },

  // 📝 Obtener incompletos
  getIncompletos: async (page = 1, limit = 20): Promise<EstudiantesResponse> => {
    const response = await api.get('/estudiantes/incompletos', {
      params: { page, limit }
    });
    return response.data;
  },
};