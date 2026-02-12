export enum NivelEducativo {
  BASICA = 'BASICA',
  BACHILLERATO = 'BACHILLERATO',
  GENERAL = 'GENERAL',
}

export enum TipoCalificacion {
  CUALITATIVA = 'CUALITATIVA',
  CUANTITATIVA = 'CUANTITATIVA',
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

export const TipoCalificacionLabels: Record<TipoCalificacion, string> = {
  [TipoCalificacion.CUALITATIVA]: 'Cualitativa',
  [TipoCalificacion.CUANTITATIVA]: 'Cuantitativa',
};

export interface Materia {
  id: string;
  nombre: string;
  nivelEducativo: NivelEducativo;
  tipoCalificacion: TipoCalificacion;
  descripcion?: string;
  estado: EstadoMateria;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMateriaDto {
  nombre: string;
  nivelEducativo: NivelEducativo;
  tipoCalificacion: TipoCalificacion;
  descripcion?: string;
}

export interface UpdateMateriaDto {
  nombre?: string;
  nivelEducativo?: NivelEducativo;
  tipoCalificacion?: TipoCalificacion;
  descripcion?: string;
}

export const isBasicaMateria = (materia: Materia): boolean =>
  materia.nivelEducativo === NivelEducativo.BASICA;

export const isBachilleratoMateria = (materia: Materia): boolean =>
  materia.nivelEducativo === NivelEducativo.BACHILLERATO;

export const isGeneralMateria = (materia: Materia): boolean =>
  materia.nivelEducativo === NivelEducativo.GENERAL;