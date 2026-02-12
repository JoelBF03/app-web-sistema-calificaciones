import { api } from './api';
import {
  PeriodoLectivo,
  CreatePeriodoLectivoData,
  UpdatePeriodoLectivoData,
  CreatePeriodoResponse,
  UpdatePeriodoResponse,
  CambiarEstadoPeriodoResponse,
  ValidarCierrePeriodoResponse,
  ActivarSupletoriosResponse,
  CerrarSupletoriosResponse,
  ReabrirSupletoriosResponse,
  Trimestre,
  UpdateTrimestreData,
  UpdateTrimestreResponse,
  ValidarCierreTrimestreResponse
} from '../types/periodo.types';

// PERÍODOS LECTIVOS
export const periodosService = {
  getAll: async (): Promise<PeriodoLectivo[]> => {
    const response = await api.get('/periodos-lectivos');
    return response.data;
  },

  getById: async (id: string): Promise<PeriodoLectivo> => {
    const response = await api.get(`/periodos-lectivos/${id}`);
    return response.data;
  },

  getPeriodoActivo: async (): Promise<PeriodoLectivo> => {
    const response = await api.get('/periodos-lectivos/periodo-activo');
    return response.data;
  },

  create: async (data: CreatePeriodoLectivoData): Promise<CreatePeriodoResponse> => {
    const response = await api.post('/periodos-lectivos', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePeriodoLectivoData): Promise<UpdatePeriodoResponse> => {
    const response = await api.put(`/periodos-lectivos/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id: string): Promise<CambiarEstadoPeriodoResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/cambiar-estado`);
    return response.data;
  },

  validarCierre: async (id: string): Promise<ValidarCierrePeriodoResponse> => {
    const response = await api.post(`/periodos-lectivos/${id}/validar-cierre`);
    return response.data;
  },

  getTrimestres: async (periodoId: string): Promise<Trimestre[]> => {
    const response = await api.get(`/periodos-lectivos/${periodoId}/trimestres`);
    return response.data;
  },

  activarSupletorios: async (id: string): Promise<ActivarSupletoriosResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/activar-supletorios`);
    return response.data;
  },

  async regresarSupletoriosPendiente(periodoId: string) {
    const response = await api.patch(
      `/periodos-lectivos/${periodoId}/regresar-supletorios-pendiente`
    );
    return response.data;
  },

  cerrarSupletorios: async (id: string): Promise<CerrarSupletoriosResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/cerrar-supletorios`);
    return response.data;
  },

  reabrirSupletorios: async (id: string): Promise<ReabrirSupletoriosResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/reabrir-supletorios`);
    return response.data;
  },
};

// TRIMESTRES
export const trimestresService = {
  getTrimestresActivos: async (): Promise<Trimestre[]> => {
    const response = await api.get('/trimestres/periodo-activo');
    return response.data;
  },

  getTrimestreActivo: async (): Promise<Trimestre> => {
    const response = await api.get('/trimestres/activo');
    return response.data;
  },

  getTrimestresByPeriodo: async (periodoId: string): Promise<Trimestre[]> => {
    const response = await api.get(`/trimestres/periodo/${periodoId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Trimestre> => {
    const response = await api.get(`/trimestres/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTrimestreData): Promise<UpdateTrimestreResponse> => {
    const response = await api.put(`/trimestres/${id}`, data);
    return response.data;
  },

  validarCierre: async (id: string): Promise<ValidarCierreTrimestreResponse> => {
    const response = await api.post(`/trimestres/${id}/validar-cierre`);
    return response.data;
  },
};