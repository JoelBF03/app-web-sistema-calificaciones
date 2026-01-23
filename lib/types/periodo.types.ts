
export enum EstadoPeriodo {
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO'
}

export enum EstadoSupletorio {
  PENDIENTE = 'PENDIENTE',
  ACTIVADO = 'ACTIVADO',
  CERRADO = 'CERRADO'
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

// INTERFACES DE ENTIDADES
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
  estado_supletorio: EstadoSupletorio;
  createdAt: string;
  updatedAt: string;
  trimestres?: Trimestre[];
}

// DTOs DE CREACIÓN
export interface CreatePeriodoLectivoData {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface CreateTrimestreData {
  nombre: NombreTrimestre;
  fechaInicio: string;
  fechaFin: string;
  periodo_lectivo_id: string;
}

// DTOs DE ACTUALIZACIÓN
export interface UpdatePeriodoLectivoData {
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface UpdateTrimestreData {
  nombre?: NombreTrimestre;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: TrimestreEstado;
}

// RESPUESTAS DE ENDPOINTS
export interface CreatePeriodoResponse {
  message: string;
  periodo: PeriodoLectivo;
  trimestres: Trimestre[];
}

export interface UpdatePeriodoResponse {
  message: string;
  periodo: PeriodoLectivo;
  advertencia?: string;
  trimestres_afectados?: number;
}


export interface CambiarEstadoPeriodoResponse {
  message: string;
  periodo: PeriodoLectivo;
  estadisticas: {
    estudiantes_graduados: number;
    estudiantes_sin_matricula: number;
    matriculas_finalizadas: number;
    materias_curso_inactivadas: number;
    cursos_inactivados: number;
  };
  advertencia: string;
}

export interface UpdateTrimestreResponse {
  message: string;
  trimestre: Trimestre;
  rollback?: {
    insumos_reabiertos: number;
    promedios_trimestre_eliminados: number;
    promedios_anuales_eliminados: number;
  };
  advertencia?: string;
  cambios?: {
    fechas_actualizadas: boolean;
    estado_actualizado: boolean;
    estado_anterior: TrimestreEstado;
    estado_nuevo: TrimestreEstado;
  };
  promedios_trimestre?: {
    generados: number;
    fallidos: number;
    estudiantes_con_errores: any[];
  };
  promedios_anuales?: {
    generados: number;
    fallidos: number;
    estudiantes_incompletos: any[];
  } | null;
}

export interface ValidarCierreTrimestreResponse {
  puede_cerrar: boolean;
  errores: any[];
  estadisticas: {
    total_estudiantes: number;
    estudiantes_completos: number;
    estudiantes_incompletos: number;
    porcentaje_completado: string;
  };
  preview_generacion?: {
    total_promedios_a_generar: number;
    estimacion_tiempo: string;
    advertencia: string;
  } | null;
}

export interface ValidarCierrePeriodoResponse {
  puede_cerrar: boolean;
  errores: string[];
  preview?: {
    total_matriculas_a_finalizar: number;
    total_cursos_a_inactivar: number;
    total_materias_curso_a_inactivar: number;
    advertencia: string;
  };
}

export interface ActivarSupletoriosResponse {
  message: string;
  periodo: PeriodoLectivo;
  estadisticas: {
    total_promedios_anuales: number;
    estudiantes_en_supletorio: number;
    estudiantes_aprobados: number;
    estudiantes_reprobados: number;
  };
}

export interface CerrarSupletoriosResponse {
  message: string;
  periodo: PeriodoLectivo;
  estadisticas: {
    total_estudiantes_en_supletorio: number;
    estudiantes_que_rindieron: number;
    estudiantes_que_no_rindieron: number;
    estudiantes_que_aprobaron: number;
    estudiantes_que_reprobaron: number;
  };
  advertencia: string;
}

export interface ReabrirSupletoriosResponse {
  message: string;
  periodo: PeriodoLectivo;
  advertencia: string;
}