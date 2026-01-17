import { api } from './api';
import { CalificacionExamen, CreateCalificacionExamenDto } from '@/lib/types/calificaciones.types';

export const calificacionExamenService = {
  async getByMateriaCursoYTrimestre(materia_curso_id: string, trimestre_id: string): Promise<CalificacionExamen[]> {
    const { data } = await api.get(`/calificacion-examen/materia-curso/${materia_curso_id}/trimestre/${trimestre_id}`);
    return data;
  },

  async findOne(id: string): Promise<CalificacionExamen> {
    const { data } = await api.get(`/calificacion-examen/${id}`);
    return data;
  },

  async createBatch(dto: CreateCalificacionExamenDto): Promise<{ calificaciones: CalificacionExamen[] }> {
    const { data } = await api.post('/calificacion-examen', dto);
    return data;
  },

  async update(id: string, dto: { calificacion_examen: number; observaciones?: string }): Promise<CalificacionExamen> {
    const { data } = await api.patch(`/calificacion-examen/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/calificacion-examen/${id}`);
  },

  async estudiantesSinCalificar(materia_curso_id: string, trimestre_id: string) {
    const { data } = await api.get(`/calificacion-examen/materia-curso/${materia_curso_id}/trimestre/${trimestre_id}/sin-calificar`);
    return data;
  }
};