// nextjs-frontend/lib/services/reportes.services.ts
import { api } from './api';

/**
 * Helper para descargar un blob como archivo
 */
const descargarBlob = (blob: Blob, nombreArchivo: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const reportesService = {
  /**
   * Descarga libreta individual de un estudiante en PDF
   */
  descargarLibretaIndividual: async (
    estudiante_id: string,
    trimestre_id: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/reportes/libreta/estudiante/${estudiante_id}/pdf`,
      {
        params: { trimestre_id },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Descarga libretas consolidadas de todo el curso en PDF
   */
  descargarLibretasCursoConsolidado: async (
    curso_id: string,
    trimestre_id: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/reportes/libreta/curso/${curso_id}/consolidado`,
      {
        params: { trimestre_id },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Descarga reporte de materia en PDF
   */
  descargarReporteMateria: async (
    materia_curso_id: string,
    trimestre_id: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/reportes/materia/${materia_curso_id}/pdf`,
      {
        params: { trimestre_id },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
 * Descarga libreta histórica por matrícula
 */
  descargarLibretaHistorica: async (matricula_id: string): Promise<void> => {
    try {
      const response = await api.get(`/reportes/libreta/matricula/${matricula_id}/pdf`, {
        responseType: 'blob',
      });

      // Crear URL del blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Crear enlace temporal y hacer click
      const link = document.createElement('a');
      link.href = url;
      link.download = `libreta_${matricula_id}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar libreta histórica:', error);
      throw error;
    }
  },

  /**
   * Descarga concentrado de calificaciones (ranking del curso) en PDF
   */
  descargarConcentradoCalificaciones: async (
    curso_id: string,
    trimestre_id: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/reportes/concentrado/curso/${curso_id}/pdf`,
      {
        params: { trimestre_id },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
 * Descarga reporte de insumos en PDF
 */
  descargarReporteInsumos: async (
    materia_curso_id: string,
    trimestre_id: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/reportes/insumos/${materia_curso_id}/pdf`,
      {
        params: { trimestre_id },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
 * Descarga reporte de rendimiento académico anual en PDF
 */
  descargarRendimientoAnual: async (
    materia_curso_id: string,
    periodo_lectivo_id: string
  ): Promise<Blob> => {
    const response = await api.get(
      `/reportes/rendimiento-anual/${materia_curso_id}/pdf`,
      {
        params: { periodo_lectivo_id },
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Helper para descargar un blob como archivo
   */
  descargarBlob,
};
