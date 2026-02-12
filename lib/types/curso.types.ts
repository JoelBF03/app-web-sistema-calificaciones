import { Docente } from "./docente.types";
import { PeriodoLectivo } from './periodo.types'

export enum EstadoCurso {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO'
}

export enum EspecialidadCurso {
  BASICA = 'BASICA',
  TECNICO = 'TECNICO', 
  CIENCIAS = 'CIENCIAS',
  
}

export enum NivelCurso {
  OCTAVO = 'OCTAVO',
  NOVENO = 'NOVENO',
  DECIMO = 'DECIMO',
  PRIMERO_BACHILLERATO = 'PRIMERO BACHILLERATO',
  SEGUNDO_BACHILLERATO = 'SEGUNDO BACHILLERATO',
  TERCERO_BACHILLERATO = 'TERCERO BACHILLERATO'
}

export const NIVEL_DISPLAY_MAP = {
  [NivelCurso.OCTAVO]: '8vo de Básica',
  [NivelCurso.NOVENO]: '9no de Básica',
  [NivelCurso.DECIMO]: '10mo de Básica',
  [NivelCurso.PRIMERO_BACHILLERATO]: '1ro de Bachillerato',
  [NivelCurso.SEGUNDO_BACHILLERATO]: '2do de Bachillerato',
  [NivelCurso.TERCERO_BACHILLERATO]: '3ro de Bachillerato'
};

export interface Curso {
  id: string;
  nivel: NivelCurso;
  paralelo: string;
  especialidad: EspecialidadCurso;
  estado: EstadoCurso;
  periodo_lectivo_id: string;
  periodo_lectivo: PeriodoLectivo,
  estudiantes_matriculados: number;
  docente_id?: string;
  docente?: Docente;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCursoDto {
  nivel: NivelCurso;
  paralelo: string;
  especialidad: EspecialidadCurso;
  periodo_lectivo_id: string;
  docente_id?: string;
}

export interface UpdateCursoDto {
  nivel?: NivelCurso;
  paralelo?: string;
  especialidad?: EspecialidadCurso;
  estado?: EstadoCurso;
  docente_id?: string | null;
}

export interface CursoStats {
  totalCursos: number;
  cursosBasica: number;
  cursosBachillerato: number;
  cursosActivos: number;
  cursosInactivos: number;
}

export const isBasicaCurso = (nivel: NivelCurso): boolean => {
  return [NivelCurso.OCTAVO, NivelCurso.NOVENO, NivelCurso.DECIMO].includes(nivel);
};

export const isBachilleratoCurso = (nivel: NivelCurso): boolean => {
  return [
    NivelCurso.PRIMERO_BACHILLERATO, 
    NivelCurso.SEGUNDO_BACHILLERATO, 
    NivelCurso.TERCERO_BACHILLERATO
  ].includes(nivel);
};