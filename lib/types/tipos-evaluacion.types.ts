export enum NombreTipoEvaluacion {
  INSUMOS = 'INSUMOS',
  PROYECTO = 'PROYECTO',
  EXAMEN = 'EXAMEN'
}

export interface TipoEvaluacion {
  id: string;
  periodo_lectivo_id: string;
  nombre: NombreTipoEvaluacion;
  porcentaje: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTipoEvaluacionData {
  periodo_lectivo_id: string;
  nombre: NombreTipoEvaluacion;
  porcentaje: number;
}

export interface CreateBatchTiposEvaluacionData {
  insumos: number;
  proyecto: number;
  examen: number;
}

export interface UpdateTipoEvaluacionData {
  porcentaje?: number;
}

export interface CreateBatchTiposResponse {
  tipos: TipoEvaluacion[];
}

export interface PorcentajesEvaluacion {
  insumos: number;
  proyecto: number;
  examen: number;
}