// lib/types/materia.types.ts
export enum NivelEducativo {
  BASICA = 'BASICA',
  BACHILLERATO = 'BACHILLERATO',
  GENERAL = 'GENERAL',
}

export enum TrimestreAplicable {
  TODOS = 'TODOS',
  PRIMERO = 'PRIMERO',
  SEGUNDO = 'SEGUNDO',
  TERCERO = 'TERCERO',
}

export enum EstadoMateria {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export const NivelEducativoLabels: Record<NivelEducativo, string> = {
  [NivelEducativo.BASICA]: 'Educación Básica',
  [NivelEducativo.BACHILLERATO]: 'Bachillerato',
  [NivelEducativo.GENERAL]: 'General (Todos los niveles)',
};

export const TrimestreAplicableLabels: Record<TrimestreAplicable, string> = {
  [TrimestreAplicable.TODOS]: 'Todos los trimestres',
  [TrimestreAplicable.PRIMERO]: 'Primer trimestre',
  [TrimestreAplicable.SEGUNDO]: 'Segundo trimestre',
  [TrimestreAplicable.TERCERO]: 'Tercer trimestre',
};

export interface Materia {
  id: string;
  nombre: string;
  nivelEducativo: NivelEducativo;
  trimestreAplicable: TrimestreAplicable;
  descripcion?: string;
  estado: EstadoMateria;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMateriaDto {
  nombre: string;
  nivelEducativo: NivelEducativo;
  trimestreAplicable: TrimestreAplicable;
  descripcion?: string;
}

export interface UpdateMateriaDto {
  nombre?: string;
  nivelEducativo?: NivelEducativo;
  trimestreAplicable?: TrimestreAplicable;
  descripcion?: string;
}

// Helpers
export const isBasicaMateria = (materia: Materia): boolean =>
  materia.nivelEducativo === NivelEducativo.BASICA;

export const isBachilleratoMateria = (materia: Materia): boolean =>
  materia.nivelEducativo === NivelEducativo.BACHILLERATO;

export const isGeneralMateria = (materia: Materia): boolean =>
  materia.nivelEducativo === NivelEducativo.GENERAL;