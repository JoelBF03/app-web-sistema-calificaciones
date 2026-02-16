import { Curso } from './curso.types';
import { Materia } from './materia.types';
import { Docente } from './docente.types';
import { PeriodoLectivo } from './periodo.types';
    
export enum EstadoMateriaCurso {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export interface MateriaCurso {
  id: string;
  curso_id: string;
  curso: Curso;
  materia_id: string;
  materia: Materia;
  periodo_lectivo_id: string;
  periodo_lectivo: PeriodoLectivo;
  docente_id?: string;
  docente?: Docente;
  estado: EstadoMateriaCurso;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMateriaCursoDto {
  curso_id: string;
  materia_id: string;
  periodo_lectivo_id: string;
  docente_id?: string;
}

export interface UpdateMateriaCursoDto {
  docente_id?: string | null;
  estado?: EstadoMateriaCurso;
}

export interface MateriaCursoByCursoResponse {
  curso: {
    id: string;
    nivel: string;
    paralelo: string;
    especialidad: string;
    periodo: string;
  };
  totalMaterias: number;
  materiasActivas: number;
  materias: MateriaCurso[];
}

export interface MateriaCursoByDocenteResponse {
  docente: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  periodo: {
    id: string;
    nombre: string;
  } | null;
  totalMaterias: number;
  materiasActivas: number;
  materias: MateriaCurso[];
}

export interface MateriaCursoByMateriaResponse {
  materia: {
    id: string;
    nombre: string;
    nivelEducativo: string;
  };
  totalCursos: number;
  cursosActivos: number;
  cursos: MateriaCurso[];
}

export interface MateriaCursoByPeriodoResponse {
  periodo: {
    id: string;
    nombre: string;
    estado: string;
  };
  totalAsignaciones: number;
  asignacionesActivas: number;
  materiasCursos: MateriaCurso[];
}

export interface MateriasDocenteResponse {
  docente: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  totalMaterias: number;
  materiasActivas: number;
  materiasCursos: MateriaCurso[];
  }