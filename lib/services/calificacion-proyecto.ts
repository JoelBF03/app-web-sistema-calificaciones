import { api } from './api';
import { CalificacionProyecto, CreateCalificacionProyectoDto } from '@/lib/types/calificaciones.types';

export const calificacionProyectoService = {
  async getByCursoYTrimestre(curso_id: string, trimestre_id: string): Promise<CalificacionProyecto[]> {
    try {
      const { data } = await api.get(`/calificacion-proyecto/curso/${curso_id}/trimestre/${trimestre_id}`);
      return data;
    } catch (error: any) {
      // Si no hay calificaciones aún (404), devolver array vacío
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async findOne(id: string): Promise<CalificacionProyecto> {
    const { data } = await api.get(`/calificacion-proyecto/${id}`);
    return data;
  },

  async create(dto: CreateCalificacionProyectoDto): Promise<CalificacionProyecto> {
    const { data } = await api.post('/calificacion-proyecto', dto);
    return data;
  },

  async update(id: string, dto: { calificacion_proyecto: number; observaciones?: string }): Promise<CalificacionProyecto> {
    const { data } = await api.patch(`/calificacion-proyecto/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/calificacion-proyecto/${id}`);
  },

  async estudiantesSinCalificar(curso_id: string, trimestre_id: string) {
    const { data } = await api.get(`/calificacion-proyecto/curso/${curso_id}/trimestre/${trimestre_id}/sin-calificar`);
    return data;
  }
};