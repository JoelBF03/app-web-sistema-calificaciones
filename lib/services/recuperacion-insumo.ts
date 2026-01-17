import { api } from './api';
import { HistorialRecuperacion, CreateRecuperacionDto, RecuperacionInsumo } from '@/lib/types/calificaciones.types';

export const recuperacionInsumoService = {
  async getByCalificacion(calificacion_insumo_id: string): Promise<HistorialRecuperacion> {
    const { data } = await api.get(`/recuperacion-insumo/calificacion/${calificacion_insumo_id}`);
    return data;
  },

  async create(dto: CreateRecuperacionDto): Promise<RecuperacionInsumo> {
    const { data } = await api.post('/recuperacion-insumo', dto);
    return data;
  },

  async update(id: string, dto: { nota_recuperacion?: number; observaciones?: string }): Promise<RecuperacionInsumo> {
    const { data } = await api.patch(`/recuperacion-insumo/${id}`, dto);
    return data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/recuperacion-insumo/${id}`);
    return data;
  }
};