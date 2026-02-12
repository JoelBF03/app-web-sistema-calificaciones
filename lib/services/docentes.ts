import { api } from './api';
import { Docente, CreateDocenteData, UpdateDocenteData, CompletarPerfilData, RegisterResponse } from '../types';


export const docentesService = {
  getAll: async (): Promise<Docente[]> => {
    const response = await api.get('/docentes');
    return response.data;
  },

  completarPerfil: async (data: CompletarPerfilData): Promise<{ perfil_completo: boolean, docente: Docente }> => {
    const response = await api.patch('/docentes/completar-perfil', data);
    return response.data;
  },  

  getById: async (id: string): Promise<Docente> => {
    const response = await api.get(`/docentes/${id}`);
    return response.data;
  },

  create: async (data: CreateDocenteData): Promise<RegisterResponse> => {
    const response = await api.post('/usuarios/register', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDocenteData): Promise<{ docente: Docente }> => {
    const response = await api.put(`/docentes/${id}`, data);
    return response.data;
  },

  getMyProfile: async (): Promise<Docente> => {
    const response = await api.get('/docentes/mi-perfil');
    return response.data;
  }
};