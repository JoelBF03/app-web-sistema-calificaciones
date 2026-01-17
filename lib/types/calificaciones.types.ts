import { TrimestreEstado } from "./periodo.types";

export enum CalificacionCualitativa {
  DA = 'DA', // Domina los aprendizajes (≥9.00)
  AA = 'AA', // Alcanza los aprendizajes (≥7.00)
  PA = 'PA', // Próximo a alcanzar (≥4.01)
  NA = 'NA'  // No alcanza (≤4.00)
}

export enum EstadoInsumo {
  BORRADOR = 'BORRADOR',
  ACTIVO = 'ACTIVO',
  PUBLICADO = 'PUBLICADO',
  CERRADO = 'CERRADO'
}

export interface Insumo {
  id: string;
  nombre: string;
  materia_curso_id: string;
  trimestre_id: string;
  docente_id: string;
  estado: EstadoInsumo;
  createdAt: string;
  updatedAt: string;
}

export interface CalificacionInsumo {
  id: string;
  insumo_id: string;
  estudiante_id: string;
  docente_id: string;
  nota_original: number;
  nota_final: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  estudiante: {
    id: string;
    nombres_completos: string;
    estudiante_cedula: string;
  };
  insumo: {
    id: string;
    nombre: string;
    estado: EstadoInsumo;
  }; 
}

export interface CalificacionProyecto {
  id: string;
  estudiante_id: string;
  curso_id: string;
  trimestre_id: string;
  docente_id: string;
  calificacion_proyecto: number;
  observaciones?: string;
  createdAt: string;
  estudiante: {
    id: string;
    nombres_completos: string;
    estudiante_cedula: string;
  };
}

export interface CalificacionExamen {
  id: string;
  estudiante_id: string;
  materia_curso_id: string;
  trimestre_id: string;
  docente_id: string;
  calificacion_examen: number;
  observaciones?: string;
  createdAt: string;
  estudiante: {
    id: string;
    nombres_completos: string;
    estudiante_cedula: string;
  };
}

export interface RecuperacionInsumo {
  id: string;
  calificacion_insumo_id: string;
  nota_recuperacion: number;
  intento: number;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistorialRecuperacion {
  calificacion: {
    id: string;
    estudiante: string;
    insumo: string;
    nota_original: number;
    nota_final: number;
  };
  total_intentos: number;
  intentos_restantes: number;
  recuperaciones: RecuperacionInsumo[];
}

export interface CreateRecuperacionDto {
  calificacion_insumo_id: string;
  nota_recuperacion: number;
  observaciones?: string;
}

// DTOs para crear calificaciones
export interface CreateCalificacionInsumoDto {
  insumo_id: string;
  estudiante_id?: string;
  nota?: number;
  observaciones?: string;
  calificaciones?: Array<{
    estudiante_id: string;
    nota: number;
    observaciones?: string;
  }>;
}

export interface CreateCalificacionProyectoDto {
  curso_id: string;
  trimestre_id: string;
  estudiante_id?: string;
  calificacion_proyecto?: number;
  observaciones?: string;
  calificaciones?: Array<{
    estudiante_id: string;
    calificacion_proyecto: number;
    observaciones?: string;
  }>;
}

export interface CreateCalificacionExamenDto {
  materia_curso_id: string;
  trimestre_id: string;
  estudiante_id?: string;
  calificacion_examen?: number;
  observaciones?: string;
  calificaciones?: Array<{
    estudiante_id: string;
    calificacion_examen: number;
    observaciones?: string;
  }>;
}

export interface Trimestre {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: TrimestreEstado;
  periodo_lectivo_id: string;
}

export interface PromedioTrimestre {
  id: string;
  estudiante_id: string;
  materia_curso_id: string;
  trimestre_id: string;
  promedio_insumos: number;
  ponderado_insumos: number;
  nota_proyecto: number;
  ponderado_proyecto: number;
  nota_examen: number;
  ponderado_examen: number;
  nota_final_trimestre: number;
  cualitativa: CalificacionCualitativa;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  estudiante: {
    id: string;
    nombres_completos: string;
    estudiante_cedula: string;
  };
  materia_curso: {
    id: string;
    materia: {
      nombre: string;
    };
  };
  trimestre: {
    id: string;
    nombre: string;
  };
}

export interface GenerarPromediosMasivoDto {
  trimestre_id: string;
}

export interface ResultadoGeneracionMasiva {
  total_procesados: number;
  total_generados: number;
  total_fallidos: number;
  estudiantes_incompletos: Array<{
    estudiante: string;
    materia: string;
    razon: string;
  }>;
}

export interface EstadisticasRendimiento {
  total_estudiantes: number;
  DA: number;
  AA: number;
  PA: number;
  NA: number;
  porcentaje_DA: number;
  porcentaje_AA: number;
  porcentaje_PA: number;
  porcentaje_NA: number;
}