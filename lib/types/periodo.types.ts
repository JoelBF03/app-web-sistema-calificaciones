
export enum EstadoPeriodo {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO'
}

export enum TrimestreEstado {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
  PENDIENTE = 'PENDIENTE'
}

export enum NombreTrimestre {
  PRIMER_TRIMESTRE = 'PRIMER TRIMESTRE',
  SEGUNDO_TRIMESTRE = 'SEGUNDO TRIMESTRE',
  TERCER_TRIMESTRE = 'TERCER TRIMESTRE'
}

export interface Trimestre {
  id: string;
  nombre: NombreTrimestre;
  fechaInicio: string;
  fechaFin: string;
  estado: TrimestreEstado;
  periodo_lectivo_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodoLectivo {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodo;
  createdAt: string;
  updatedAt: string;
  trimestres?: Trimestre[];
}

export interface CreatePeriodoLectivoData {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface CreatePeriodoResponse {
  message: string;
  periodo: PeriodoLectivo;
  trimestres: Trimestre[];
}