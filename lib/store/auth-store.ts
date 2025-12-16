import { create } from 'zustand';
import { Usuario } from '@/lib/types/auth.types';

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  isAuthenticated: false,
  isLoading: true,

  login: (token: string, usuario: Usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    set({ 
      usuario, 
      isAuthenticated: true,
      isLoading: false 
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    set({ 
      usuario: null, 
      isAuthenticated: false,
      isLoading: false 
    });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    
    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        set({ 
          usuario, 
          isAuthenticated: true,
          isLoading: false 
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        set({ 
          usuario: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } else {
      set({ 
        usuario: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));