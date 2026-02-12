import { api } from './api';
import { Insumo } from '@/lib/types/calificaciones.types';

export const insumosService = {
  async getByMateriaCursoYTrimestre(materia_curso_id: string, trimestre_id: string): Promise<Insumo[]> {
    const { data } = await api.get(`/insumos/materia-curso/${materia_curso_id}/trimestre/${trimestre_id}`);
    return data;
  },

  async create(createInsumoDto: { materia_curso_id: string; trimestre_id: string; nombre?: string }): Promise<Insumo> {
    const { data } = await api.post('/insumos', createInsumoDto);
    return data;
  },

  async update(id: string, updateInsumoDto: { nombre?: string }): Promise<Insumo> {
    const { data } = await api.put(`/insumos/${id}`, updateInsumoDto);
    return data;
  },

  async publicar(id: string): Promise<Insumo> {
    const { data } = await api.patch(`/insumos/${id}/publicar`);
    return data;
  },

  async reactivar(id: string): Promise<Insumo> {
    const { data } = await api.patch(`/insumos/${id}/reactivar`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/insumos/${id}`);
  }
};