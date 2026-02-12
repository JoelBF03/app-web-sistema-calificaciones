import { api } from './api';
import {
  CalificacionComponenteCualitativo,
  CalificarMasivoDto,
  ComponenteCualitativo
} from '@/lib/types/calificaciones.types';

export const calificacionCualitativaService = {

  async calificarMasivo(dto: CalificarMasivoDto): Promise<{
    message: string;
    resultados: {
      creados: number;
      actualizados: number;
      errores: number;
    };
  }> {
    const { data } = await api.post('/calificacion-cualitativa/calificar-masivo', dto);
    return data;
  },

  async getByCursoYTrimestre(
    curso_id: string,
    trimestre_id: string
  ): Promise<CalificacionComponenteCualitativo[]> {
    const { data } = await api.get(
      `/calificacion-cualitativa/curso/${curso_id}/trimestre/${trimestre_id}`
    );
    return data;
  },

  async getByEstudiantePeriodo(
    estudiante_id: string,
    periodo_id: string
  ): Promise<CalificacionComponenteCualitativo[]> {
    const { data } = await api.get(
      `/calificacion-cualitativa/estudiante/${estudiante_id}/periodo/${periodo_id}`
    );
    return data;
  },

  async getComponentesPorNivel(nivel: string): Promise<ComponenteCualitativo[]> {
    const { data } = await api.get(`/calificacion-cualitativa/componentes/${nivel}`);
    return data;
  },

  async findOne(id: string): Promise<CalificacionComponenteCualitativo> {
    const { data } = await api.get(`/calificacion-cualitativa/${id}`);
    return data;
  },

  async update(
    id: string,
    updateDto: { calificacion?: string | null }
  ): Promise<CalificacionComponenteCualitativo> {
    const { data } = await api.patch(`/calificacion-cualitativa/${id}`, updateDto);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/calificacion-cualitativa/${id}`);
    return data;
  }
};