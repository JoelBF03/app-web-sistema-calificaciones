import { Role, Estado } from './usuario.types';

export enum NivelAsignado {
  BASICA = 'BASICA',
  BACHILLERATO = 'BACHILLERATO',
  GLOBAL = 'GLOBAL'
}


// Interface del docente
export interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  nivelAsignado: NivelAsignado;
  foto_perfil_url: string | null;
  foto_titulo_url: string | null;
  perfil_completo: boolean;
  createdAt: string;
  updatedAt: string;
  usuario_id: {
    id: string;
    email: string;
    estado: Estado;
    rol: Role;
    createdAt?: string;
  };
}

// Para el registro (RegisterDto)
export interface CreateDocenteData {
  email: string;
  password: string;
  rol: Role;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  nivel_asignado: NivelAsignado;
}

// Para actualizar docente (UpdateDocenteDto)
export interface UpdateDocenteData {
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  telefono?: string;
  nivelAsignado?: NivelAsignado;
  foto_perfil_url?: string;
  foto_titulo_url?: string;
}

// Para completar perfil (CompletarPerfilDto)
export interface CompletarPerfilData {
  foto_perfil_url?: string;
  telefono?: string;
  foto_titulo_url?: string;
}

// Respuesta del registro
export interface RegisterResponse {
  message: string;
  usuario: {
    id: string;
    email: string;
    rol: Role;
    estado: Estado;
    createdAt: string;
    updatedAt: string;
  };
  docente?: {
    id: string;
    nombres: string;
    apellidos: string;
    cedula: string;
    telefono: string;
    nivel_asignado: NivelAsignado;
  };
}