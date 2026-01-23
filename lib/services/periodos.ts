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
  // Obtener todos los períodos lectivos
  getAll: async (): Promise<PeriodoLectivo[]> => {
    const response = await api.get('/periodos-lectivos');
    return response.data;
  },

  // Obtener un período lectivo por ID
  getById: async (id: string): Promise<PeriodoLectivo> => {
    const response = await api.get(`/periodos-lectivos/${id}`);
    return response.data;
  },

  // Obtener período activo
  getPeriodoActivo: async (): Promise<PeriodoLectivo> => {
    const response = await api.get('/periodos-lectivos/periodo-activo');
    return response.data;
  },

  // Crear nuevo período lectivo
  create: async (data: CreatePeriodoLectivoData): Promise<CreatePeriodoResponse> => {
    const response = await api.post('/periodos-lectivos', data);
    return response.data;
  },

  // Actualizar período lectivo (solo nombre y fechas)
  update: async (id: string, data: UpdatePeriodoLectivoData): Promise<UpdatePeriodoResponse> => {
    const response = await api.put(`/periodos-lectivos/${id}`, data);
    return response.data;
  },

  // Cambiar estado del período lectivo (solo ACTIVO → FINALIZADO)
  cambiarEstado: async (id: string): Promise<CambiarEstadoPeriodoResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/cambiar-estado`);
    return response.data;
  },

  // Validar si se puede cerrar un período
  validarCierre: async (id: string): Promise<ValidarCierrePeriodoResponse> => {
    const response = await api.post(`/periodos-lectivos/${id}/validar-cierre`);
    return response.data;
  },

  // Obtener trimestres de un período
  getTrimestres: async (periodoId: string): Promise<Trimestre[]> => {
    const response = await api.get(`/periodos-lectivos/${periodoId}/trimestres`);
    return response.data;
  },

  // 🆕 Activar período de supletorios
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

  // 🆕 Cerrar período de supletorios
  cerrarSupletorios: async (id: string): Promise<CerrarSupletoriosResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/cerrar-supletorios`);
    return response.data;
  },

  // 🆕 Reabrir supletorios
  reabrirSupletorios: async (id: string): Promise<ReabrirSupletoriosResponse> => {
    const response = await api.patch(`/periodos-lectivos/${id}/reabrir-supletorios`);
    return response.data;
  },
};

// TRIMESTRES
export const trimestresService = {
  // Obtener trimestres del período activo
  getTrimestresActivos: async (): Promise<Trimestre[]> => {
    const response = await api.get('/trimestres/periodo-activo');
    return response.data;
  },

  // Obtener trimestre activo actual
  getTrimestreActivo: async (): Promise<Trimestre> => {
    const response = await api.get('/trimestres/activo');
    return response.data;
  },

  // Obtener trimestres de un período específico
  getTrimestresByPeriodo: async (periodoId: string): Promise<Trimestre[]> => {
    const response = await api.get(`/trimestres/periodo/${periodoId}`);
    return response.data;
  },

  // Obtener un trimestre específico
  getById: async (id: string): Promise<Trimestre> => {
    const response = await api.get(`/trimestres/${id}`);
    return response.data;
  },

  // Actualizar trimestre
  update: async (id: string, data: UpdateTrimestreData): Promise<UpdateTrimestreResponse> => {
    const response = await api.put(`/trimestres/${id}`, data);
    return response.data;
  },

  // Validar si se puede cerrar un trimestre
  validarCierre: async (id: string): Promise<ValidarCierreTrimestreResponse> => {
    const response = await api.post(`/trimestres/${id}/validar-cierre`);
    return response.data;
  },
};