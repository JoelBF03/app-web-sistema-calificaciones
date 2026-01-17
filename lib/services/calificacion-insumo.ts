import { api } from './api';
import { CalificacionInsumo, CreateCalificacionInsumoDto } from '@/lib/types/calificaciones.types';

export const calificacionInsumoService = {
  async getByInsumo(insumo_id: string): Promise<CalificacionInsumo[]> {
    const { data } = await api.get(`/calificacion-insumo/insumo/${insumo_id}`);
    return data;
  },

  async findOne(id: string): Promise<CalificacionInsumo> {
    const { data } = await api.get(`/calificacion-insumo/${id}`);
    return data;
  },

  async createBatch(dto: CreateCalificacionInsumoDto): Promise<{ calificaciones: CalificacionInsumo[] }> {
    const { data } = await api.post('/calificacion-insumo', dto);
    return data;
  },

  async update(id: string, dto: { nota: number; observaciones?: string }): Promise<CalificacionInsumo> {
    const { data } = await api.patch(`/calificacion-insumo/${id}`, dto);
    return data;
  },

  async estudiantesSinCalificar(insumo_id: string) {
    const { data } = await api.get(`/calificacion-insumo/insumo/${insumo_id}/sin-calificar`);
    return data;
  },
  
  async remove(id: string) {
    const { data } = await api.delete(`/calificacion-insumo/${id}`);
    return data;
  }
};