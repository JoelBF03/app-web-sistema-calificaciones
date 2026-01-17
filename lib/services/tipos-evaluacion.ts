import { api } from './api';
import {
  TipoEvaluacion,
  CreateTipoEvaluacionData,
  CreateBatchTiposEvaluacionData,
  CreateBatchTiposResponse,
  UpdateTipoEvaluacionData
} from '../types/tipos-evaluacion.types';

export const tiposEvaluacionService = {
  // 📋 Obtener todos los tipos de evaluación
  findAll: async (): Promise<TipoEvaluacion[]> => {
    const response = await api.get('/tipos-evaluacion');
    return response.data;
  },

  // 👁️ Obtener tipo de evaluación por ID
  findOne: async (id: string): Promise<TipoEvaluacion> => {
    const response = await api.get(`/tipos-evaluacion/${id}`);
    return response.data;
  },

  // 📋 Obtener tipos de evaluación por período
  getByPeriodo: async (periodo_id: string): Promise<TipoEvaluacion[]> => {
    const response = await api.get(`/tipos-evaluacion/periodo/${periodo_id}`);
    return response.data;
  },

  // ➕ Crear tipo de evaluación individual
  create: async (data: CreateTipoEvaluacionData): Promise<TipoEvaluacion> => {
    const response = await api.post('/tipos-evaluacion', data);
    return response.data;
  },

  // ➕ Crear los 3 tipos de evaluación de una vez
  createBatch: async (periodo_id: string, porcentajes: CreateBatchTiposEvaluacionData): Promise<CreateBatchTiposResponse> => {
    const response = await api.post(`/tipos-evaluacion/batch/${periodo_id}`, porcentajes);
    return response.data;
  },

  // ✏️ Actualizar los 3 porcentajes de una vez
  updateBatch: async (periodo_id: string, porcentajes: {
    insumos: number;
    proyecto: number;
    examen: number;
  }) => {
    const response = await api.put(`/tipos-evaluacion/batch/${periodo_id}`, porcentajes);
    return response.data;
  },

  // ✏️ Actualizar tipo de evaluación (solo porcentaje)
  update: async (id: string, data: UpdateTipoEvaluacionData): Promise<TipoEvaluacion> => {
    const response = await api.put(`/tipos-evaluacion/${id}`, data);
    return response.data;
  },

  // 🔍 Verificar si hay promedios generados
  verificarPromediosGenerados: async (periodo_id: string) => {
    const response = await api.get(`/tipos-evaluacion/periodo/${periodo_id}/verificar-promedios`);
    return response.data;
  },
};