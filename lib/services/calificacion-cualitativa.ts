import { api } from './api';
import {
  CalificacionComponenteCualitativo,
  CalificarMasivoDto,
  ComponenteCualitativo
} from '@/lib/types/calificaciones.types';

export const calificacionCualitativaService = {
  // CALIFICACIÓN MASIVA (Tutor guarda toda la tabla)
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

  // ✅ CORREGIR: Retorna CalificacionComponenteCualitativo[], NO CalificacionComponente[]
  async getByCursoYTrimestre(
    curso_id: string,
    trimestre_id: string
  ): Promise<CalificacionComponenteCualitativo[]> {
    const { data } = await api.get(
      `/calificacion-cualitativa/curso/${curso_id}/trimestre/${trimestre_id}`
    );
    return data;
  },

  // ✅ CORREGIR: Retorna CalificacionComponenteCualitativo[], NO CalificacionCualitativa[]
  async getByEstudiantePeriodo(
    estudiante_id: string,
    periodo_id: string
  ): Promise<CalificacionComponenteCualitativo[]> {
    const { data } = await api.get(
      `/calificacion-cualitativa/estudiante/${estudiante_id}/periodo/${periodo_id}`
    );
    return data;
  },

  // Obtener componentes según nivel educativo (BASICA o BACHILLERATO)
  async getComponentesPorNivel(nivel: string): Promise<ComponenteCualitativo[]> {
    const { data } = await api.get(`/calificacion-cualitativa/componentes/${nivel}`);
    return data;
  },

  // ✅ CORREGIR: CRUD Individual retorna CalificacionComponenteCualitativo
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