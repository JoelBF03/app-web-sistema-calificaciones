
export enum Estado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
}

export enum Role {
  DOCENTE = 'DOCENTE',
  SECRETARIA = 'SECRETARIA',
  ADMIN = 'ADMIN'
}

export interface ResetPasswordData {
  newPassword: string;
}

export interface CambiarPasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface CambiarEstadoResponse {
  message: string;
  usuario: {
    id: string;
    email: string;
    rol: Role;
    estado: Estado;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CambiarEmailData {
  email: string;
}

export interface CambiarRolData {
  rol: Role;
}

export interface CambiarRolResponse {
  message: string;
  usuario: {
    id: string;
    email: string;
    rol: Role;
    estado: Estado;
    createdAt: string;
    updatedAt: string;
  };
  rol_anterior: Role;
  rol_nuevo: Role;
}