import { Matricula } from "./matricula.types";

export enum EstadoEstudiante {
  ACTIVO = 'ACTIVO',
  SIN_MATRICULA = 'SIN_MATRICULA',
  GRADUADO = 'GRADUADO',
  RETIRADO = 'RETIRADO',
}

export interface Estudiante {
  id: string;
  estudiante_cedula: string;
  nombres_completos: string;
  estudiante_email?: string;
  fecha_de_nacimiento?: string;
  direccion?: string;
  
  // Padre
  padre_nombre?: string;
  padre_apellido?: string;
  padre_cedula?: string;
  
  // Madre
  madre_nombre?: string;
  madre_apellido?: string;
  madre_cedula?: string;
  viven_juntos?: boolean;
  
  // Representante
  representante_nombre?: string;
  representante_apellido?: string;
  representante_telefono?: string;
  representante_telefono_auxiliar?: string;
  representante_correo?: string;
  representante_parentesco?: string;
  
  datos_completos: boolean;
  estado: EstadoEstudiante;
  matriculas?: Matricula[];
  
  created_at: string;
  updated_at: string;
}

export interface CreateEstudianteDto {
  estudiante_cedula: string;
  nombres_completos: string;
  estudiante_email?: string;
  fecha_de_nacimiento?: string;
  direccion?: string;
  
  padre_nombre?: string;
  padre_apellido?: string;
  padre_cedula?: string;
  
  madre_nombre?: string;
  madre_apellido?: string;
  madre_cedula?: string;
  viven_juntos?: boolean;
  
  representante_nombre?: string;
  representante_apellido?: string;
  representante_telefono?: string;
  representante_telefono_auxiliar?: string;
  representante_correo?: string;
  representante_parentesco?: string;
}

export interface UpdateEstudianteDto extends Partial<CreateEstudianteDto> {
  estado?: EstadoEstudiante;
}

export interface EstudiantesResponse {
  data: Estudiante[];
  total: number;
  page: number;
  lastPage: number;
}

export interface EstadisticasEstudiantes {
  activos: number;
  sinMatricula: number;
  completos: number;
  incompletos: number;
  graduados: number;
  retirados: number;
}