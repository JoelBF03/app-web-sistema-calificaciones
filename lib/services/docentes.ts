import { api } from './api';
import { Docente, CreateDocenteData, UpdateDocenteData, CompletarPerfilData, RegisterResponse } from '../types';


export const docentesService = {
  // 👑 ADMIN: Obtener todos los docentes
  getAll: async (): Promise<Docente[]> => {
    const response = await api.get('/docentes');
    return response.data;
  },

  // 👤 DOCENTE: Completar mi perfil
  completarPerfil: async (data: CompletarPerfilData): Promise<{ perfil_completo: boolean, docente: Docente }> => {
    const response = await api.patch('/docentes/completar-perfil', data);
    return response.data;
  },  

  // 👑 ADMIN: Obtener docente por ID
  getById: async (id: string): Promise<Docente> => {
    const response = await api.get(`/docentes/${id}`);
    return response.data;
  },

  // 👑 ADMIN: Crear nuevo docente (a través de auth/register)
  create: async (data: CreateDocenteData): Promise<RegisterResponse> => {
    const response = await api.post('/usuarios/register', data);
    return response.data;
  },

  // 👑 ADMIN: Actualizar docente
  update: async (id: string, data: UpdateDocenteData): Promise<{ docente: Docente }> => {
    const response = await api.put(`/docentes/${id}`, data);
    return response.data;
  },

  // 👤 DOCENTE: Obtener mi perfil
  getMyProfile: async (): Promise<Docente> => {
    const response = await api.get('/docentes/mi-perfil');
    return response.data;
  }
};