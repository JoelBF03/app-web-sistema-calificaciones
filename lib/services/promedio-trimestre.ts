import { api } from './api';
import { PromedioTrimestre, GenerarPromediosMasivoDto, ResultadoGeneracionMasiva } from '@/lib/types/calificaciones.types';

export const promedioTrimestreService = {
  async getByMateriaCursoYTrimestre(materia_curso_id: string, trimestre_id: string): Promise<PromedioTrimestre[]> {
    try {
      const { data } = await api.get(`/promedio-trimestre/materia-curso/${materia_curso_id}/trimestre/${trimestre_id}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async getByCursoYTrimestre(curso_id: string, trimestre_id: string): Promise<PromedioTrimestre[]> {
    try {
      const { data } = await api.get(`/promedio-trimestre/curso/${curso_id}/trimestre/${trimestre_id}`);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async getByEstudiante(estudiante_id: string): Promise<PromedioTrimestre[]> {
    const { data } = await api.get(`/promedio-trimestre/estudiante/${estudiante_id}`);
    return data;
  },

  async findOne(id: string): Promise<PromedioTrimestre> {
    const { data } = await api.get(`/promedio-trimestre/${id}`);
    return data;
  },

  async generarPromediosMasivo(dto: GenerarPromediosMasivoDto): Promise<ResultadoGeneracionMasiva> {
    const { data } = await api.post('/promedio-trimestre/generar-masivo', dto);
    return data;
  },

  async update(id: string, observaciones: string): Promise<PromedioTrimestre> {
    const { data } = await api.patch(`/promedio-trimestre/${id}`, { observaciones });
    return data;
  },

  async recalcular(id: string): Promise<PromedioTrimestre> {
    const { data } = await api.patch(`/promedio-trimestre/${id}/recalcular`);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/promedio-trimestre/${id}`);
  }
};