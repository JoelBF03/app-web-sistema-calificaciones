import { EspecialidadCurso, NivelCurso } from "./curso.types";

export enum EstadoMatricula {
  ACTIVO = 'ACTIVO',
  RETIRADO = 'RETIRADO',
  INACTIVO = 'INACTIVO',
}

export enum OrigenMatricula {
    DISTRITO = 'DISTRITO',
    MANUAL = 'MANUAL',    
}

export interface Matricula {
  id: string;
  estudiante_cedula: string;
  numero_de_matricula: string;
  nombres_completos: string;
  estudiante_email?: string;
  curso_id: string;
  curso?: {
    id: string;
    nivel: NivelCurso;
    paralelo: string;
    especialidad: EspecialidadCurso;
  };
  periodo_lectivo_id: string;
  periodo_lectivo?: {
    id: string;
    nombre: string;
  };
  estado: EstadoMatricula;
  origen: OrigenMatricula;
  fecha_retiro?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatriculaDto {
  estudiante_cedula: string;
  nombres_completos: string;
  estudiante_email?: string;
  curso_id: string;
  periodo_lectivo_id: string;
  origen?: OrigenMatricula;
}

export interface UpdateMatriculaDto extends Partial<CreateMatriculaDto> {
  estado?: EstadoMatricula;
  fecha_retiro?: string;
  observaciones?: string;
}

export interface RegistroImportacionDto {
  fila: number;
  sheet: string;
  año: string;
  paralelo: string;
  especialidad: string;
  cedula: string;
  nombres_completos: string;
  correo: string;
  curso_parseado?: string;
  curso_id?: string;
  valido: boolean;
  errores: string[];
}

export interface ResumenImportacionDto {
  preview_id: string;
  total_registros: number;
  validos: number;
  invalidos: number;
  registros: RegistroImportacionDto[];
}

export interface ResultadoImportacionDto {
  exitosas: number;
  fallidas: number;
  detalles: {
    cedula: string;
    nombre: string;
    curso: string;
    estado: 'EXITOSO' | 'FALLIDO';
    error?: string;
  }[];
  resumen: {
    registros_recibidos: number;
    registros_validos: number;
    registros_invalidos: number;
    registros_importados: number;
    registros_fallidos: number;
  };
}