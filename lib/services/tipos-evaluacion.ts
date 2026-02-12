import { api } from './api';
import {
  TipoEvaluacion,
  CreateTipoEvaluacionData,
  CreateBatchTiposEvaluacionData,
  CreateBatchTiposResponse,
  UpdateTipoEvaluacionData
} from '../types/tipos-evaluacion.types';

export const tiposEvaluacionService = {
  findAll: async (): Promise<TipoEvaluacion[]> => {
    const response = await api.get('/tipos-evaluacion');
    return response.data;
  },

  findOne: async (id: string): Promise<TipoEvaluacion> => {
    const response = await api.get(`/tipos-evaluacion/${id}`);
    return response.data;
  },

  getByPeriodo: async (periodo_id: string): Promise<TipoEvaluacion[]> => {
    const response = await api.get(`/tipos-evaluacion/periodo/${periodo_id}`);
    return response.data;
  },

  create: async (data: CreateTipoEvaluacionData): Promise<TipoEvaluacion> => {
    const response = await api.post('/tipos-evaluacion', data);
    return response.data;
  },

  createBatch: async (periodo_id: string, porcentajes: CreateBatchTiposEvaluacionData): Promise<CreateBatchTiposResponse> => {
    const response = await api.post(`/tipos-evaluacion/batch/${periodo_id}`, porcentajes);
    return response.data;
  },

  updateBatch: async (periodo_id: string, porcentajes: {
    insumos: number;
    proyecto: number;
    examen: number;
  }) => {
    const response = await api.put(`/tipos-evaluacion/batch/${periodo_id}`, porcentajes);
    return response.data;
  },

  update: async (id: string, data: UpdateTipoEvaluacionData): Promise<TipoEvaluacion> => {
    const response = await api.put(`/tipos-evaluacion/${id}`, data);
    return response.data;
  },

  verificarPromediosGenerados: async (periodo_id: string) => {
    const response = await api.get(`/tipos-evaluacion/periodo/${periodo_id}/verificar-promedios`);
    return response.data;
  },
};