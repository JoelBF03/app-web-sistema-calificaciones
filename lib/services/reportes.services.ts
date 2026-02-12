import { api } from './api';

const procesarDescarga = (response: any, nombreFallback: string) => {
  const disposition = response.headers['content-disposition'];
  let nombreArchivo = nombreFallback;

  if (disposition && disposition.includes('filename=')) {
    nombreArchivo = disposition
      .split('filename=')[1]
      .split(';')[0]
      .replace(/"/g, '');
  }

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nombreArchivo);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportesService = {
  descargarLibretaIndividual: async (estudiante_id: string, trimestre_id: string, nombreEstudiante: string) => {
    const response = await api.get(`/reportes/libreta/estudiante/${estudiante_id}/pdf`, {
      params: { trimestre_id },
      responseType: 'blob',
    });
    const backupName = `Libreta_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
    procesarDescarga(response, backupName);
  },

  descargarLibretasCursoConsolidado: async (curso_id: string, trimestre_id: string, nombreCurso: string) => {
    const response = await api.get(`/reportes/libreta/curso/${curso_id}/consolidado`, {
      params: { trimestre_id },
      responseType: 'blob',
    });
    const backupName = `Libretas_Consolidadas_${nombreCurso.replace(/\s+/g, '_')}.pdf`;
    procesarDescarga(response, backupName);
  },

  descargarReporteMateria: async (materia_curso_id: string, trimestre_id: string) => {
    const response = await api.get(`/reportes/materia/${materia_curso_id}/pdf`, {
      params: { trimestre_id },
      responseType: 'blob',
    });
    procesarDescarga(response, `reporte_materia.pdf`);
  },

  descargarLibretaHistorica: async (matricula_id: string) => {
    const response = await api.get(`/reportes/libreta/matricula/${matricula_id}/pdf`, {
      responseType: 'blob',
    });
    procesarDescarga(response, `libreta_historica_${matricula_id}.pdf`);
  },

descargarConcentradoCalificaciones: async (curso_id: string, trimestre_id: string) => {
    const response = await api.get(`/reportes/concentrado/curso/${curso_id}/pdf`, {
      params: { trimestre_id },
      responseType: 'blob',
    });
    procesarDescarga(response, `Concentrado_Calificaciones.pdf`);
  },

  descargarReporteInsumos: async (materia_curso_id: string, trimestre_id: string) => {
    const response = await api.get(`/reportes/insumos/${materia_curso_id}/pdf`, {
      params: { trimestre_id },
      responseType: 'blob',
    });
    procesarDescarga(response, `reporte_insumos.pdf`);
  },

  descargarRendimientoAnual: async (materia_curso_id: string, periodo_lectivo_id: string) => {
    const response = await api.get(`/reportes/rendimiento-anual/${materia_curso_id}/pdf`, {
      params: { periodo_lectivo_id },
      responseType: 'blob',
    });
    procesarDescarga(response, `rendimiento_anual.pdf`);
  },
};