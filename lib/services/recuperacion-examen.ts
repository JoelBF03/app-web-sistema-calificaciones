import { api } from './api';
import { HistorialRecuperacionExamen, CreateRecuperacionExamenDto, UpdateRecuperacionExamenDto, RecuperacionExamen } from '@/lib/types/calificaciones.types';

export const recuperacionExamenService = {
  async getByCalificacion(calificacion_examen_id: string): Promise<HistorialRecuperacionExamen> {
    const { data } = await api.get(`/recuperacion-examen/calificacion/${calificacion_examen_id}`);
    return data;
  },

  async create(dto: CreateRecuperacionExamenDto): Promise<RecuperacionExamen> {
    const { data } = await api.post('/recuperacion-examen', dto);
    return data;
  },

  async update(id: string, dto: UpdateRecuperacionExamenDto): Promise<RecuperacionExamen> {
    const { data } = await api.patch(`/recuperacion-examen/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/recuperacion-examen/${id}`);
    return data;
  }
};