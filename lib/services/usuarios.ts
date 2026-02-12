// app/lib/services/usuarios.ts
import { api } from './api';
import { Role, CambiarEmailData, CambiarEstadoResponse, ResetPasswordData, CambiarPasswordData } from '../types';

export const usuariosService = {
  cambiarEstado: async (userId: string): Promise<CambiarEstadoResponse> => {
    const response = await api.patch(`/usuarios/${userId}/cambiar-estado`);
    return response.data;
  },

  cambiarRol: async (userId: string, rol: Role) => {
    const response = await api.patch(`/usuarios/${userId}/cambiar-rol`, { rol });
    return response.data;
  },

  resetPassword: async (userId: string, data: ResetPasswordData) => {
    const response = await api.patch(`/usuarios/${userId}/reset-password`, data);
    return response.data;
  },

  cambiarMiPassword: async (data: CambiarPasswordData) => {
    const response = await api.patch('/usuarios/cambiar-password', data);
    return response.data;
  },

  update: async (userId: string, data: CambiarEmailData) => {
    const response = await api.patch(`/usuarios/${userId}`, data);
    return response.data;
  }
};