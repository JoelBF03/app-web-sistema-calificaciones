import { api } from './api';
import { PeriodoLectivo, CreatePeriodoLectivoData, CreatePeriodoResponse, Trimestre } from '../types';

export const periodosService = {
  // 📋 Obtener todos los períodos lectivos
  getAll: async (): Promise<PeriodoLectivo[]> => {
    const response = await api.get('/periodos-lectivos');
    return response.data;
  },

  // 👁️ Obtener un período lectivo por ID
  getById: async (id: string): Promise<PeriodoLectivo> => {
    const response = await api.get(`/periodos-lectivos/${id}`);
    return response.data;
  },

  // 👁️ Obtener período activo
  getPeriodoActivo: async (): Promise<PeriodoLectivo> => {
    const response = await api.get('/periodos-lectivos/periodo-activo');
    return response.data;
  },

  // ➕ Crear nuevo período lectivo
  create: async (data: CreatePeriodoLectivoData): Promise<CreatePeriodoResponse> => {
    const response = await api.post('/periodos-lectivos', data);
    return response.data;
  },

  // ✏️ Actualizar período lectivo
  update: async (id: string, data: Partial<CreatePeriodoLectivoData>) => {
    const response = await api.put(`/periodos-lectivos/${id}`, data);
    return response.data; // { message, periodo, advertencia?, trimestres_afectados? }
  },

  // 🔄 Cambiar estado del período lectivo
  cambiarEstado: async (id: string) => {
    const response = await api.patch(`/periodos-lectivos/${id}/cambiar-estado`);
    return response.data; // { message, periodo: { id, nombre, estado_anterior, estado_nuevo } }
  },

  // 📅 Obtener trimestres de un período
  getTrimestres: async (periodoId: string): Promise<Trimestre[]> => {
    const response = await api.get(`/periodos-lectivos/${periodoId}/trimestres`);
    return response.data;
  },
};

export const trimestresService = {
  // 📋 Obtener trimestres del período activo
  getTrimestresActivos: async (): Promise<Trimestre[]> => {
    const response = await api.get('/trimestres/periodo-activo');
    return response.data;
  },

  // 👁️ Obtener trimestre activo actual
  getTrimestreActivo: async (): Promise<Trimestre> => {
    const response = await api.get('/trimestres/activo');
    return response.data;
  },

  // 📋 Obtener trimestres de un período específico
  getTrimestresByPeriodo: async (periodoId: string): Promise<Trimestre[]> => {
    const response = await api.get(`/trimestres/periodo/${periodoId}`);
    return response.data;
  },

  // 👁️ Obtener un trimestre específico
  getById: async (id: string): Promise<Trimestre> => {
    const response = await api.get(`/trimestres/${id}`);
    return response.data;
  },

  // ✏️ Actualizar trimestre
  update: async (id: string, data: Partial<Trimestre>) => {
    const response = await api.put(`/trimestres/${id}`, data);
    return response.data; // { message, trimestre }
  },
};