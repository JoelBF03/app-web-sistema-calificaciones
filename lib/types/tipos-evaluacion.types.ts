export enum NombreTipoEvaluacion {
  INSUMOS = 'INSUMOS',
  PROYECTO = 'PROYECTO',
  EXAMEN = 'EXAMEN'
}

// ============================================
// INTERFACES DE ENTIDADES
// ============================================

export interface TipoEvaluacion {
  id: string;
  periodo_lectivo_id: string;
  nombre: NombreTipoEvaluacion;
  porcentaje: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs DE CREACIÓN
// ============================================

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

// ============================================
// DTOs DE ACTUALIZACIÓN
// ============================================

export interface UpdateTipoEvaluacionData {
  porcentaje?: number;
}

// ============================================
// RESPUESTAS DE ENDPOINTS
// ============================================

export interface CreateBatchTiposResponse {
  tipos: TipoEvaluacion[];
}

export interface PorcentajesEvaluacion {
  insumos: number;
  proyecto: number;
  examen: number;
}