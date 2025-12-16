'use client';

import { useState, useCallback } from 'react';
import { usuariosService } from '@/lib/services/usuarios';
import type { Role, CambiarEstadoResponse, ResetPasswordData, CambiarPasswordData, CambiarEmailData } from '@/lib/types/usuario.types';

export function useUsuarios() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 CAMBIAR ESTADO DE USUARIO (ACTIVO/INACTIVO)
  const cambiarEstado = useCallback(async (userId: string): Promise<CambiarEstadoResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuariosService.cambiarEstado(userId);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cambiar estado del usuario';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 👑 CAMBIAR ROL DE USUARIO
  const cambiarRol = useCallback(async (userId: string, rol: Role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuariosService.cambiarRol(userId, rol);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cambiar rol del usuario';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 RESETEAR CONTRASEÑA (ADMIN)
  const resetearPassword = useCallback(async (userId: string, data: ResetPasswordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuariosService.resetPassword(userId, data);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al resetear contraseña';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔑 CAMBIAR MI CONTRASEÑA (USUARIO)
  const cambiarMiPassword = useCallback(async (data: CambiarPasswordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuariosService.cambiarMiPassword(data);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al cambiar contraseña';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✏️ ACTUALIZAR EMAIL
  const actualizarEmail = useCallback(async (userId: string, data: CambiarEmailData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuariosService.update(userId, data);
      return response;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar email';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    cambiarEstado,
    cambiarRol,
    resetearPassword,
    cambiarMiPassword,
    actualizarEmail,
  };
}