import { useState } from 'react';
import { toast } from 'sonner';
import { reportesService } from '@/lib/services/reportes.services';

export const useReportes = () => {
  const [descargando, setDescargando] = useState(false);

  const ejecutarDescarga = async (
    callback: () => Promise<void>,
    loadingMsg: string,
    successMsg: string,
    toastId: string
  ) => {
    try {
      setDescargando(true);
      toast.loading(loadingMsg, { id: toastId });
      await callback();
      toast.success(successMsg, { id: toastId });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al descargar el reporte',
        { id: toastId }
      );
    } finally {
      setDescargando(false);
    }
  };

  //Libreta individual (generada por tutor)
  const descargarLibretaIndividual = (estudiante_id: string, trimestre_id: string, nombreEstudiante: string) =>
    ejecutarDescarga(
      () => reportesService.descargarLibretaIndividual(estudiante_id, trimestre_id, nombreEstudiante),
      'Generando libreta...',
      'Libreta descargada',
      'libreta-ind'
    );

  // Libretas individuales consolidadas de todo el curso (generada por tutor)
  const descargarLibretasCurso = (curso_id: string, trimestre_id: string, nombreCurso: string) =>
    ejecutarDescarga(
      () => reportesService.descargarLibretasCursoConsolidado(curso_id, trimestre_id, nombreCurso),
      'Generando consolidado...',
      'Consolidado descargado',
      'libreta-curso'
    );
  // Reporte trimestral de materia (generada por docente)  
  const descargarReporteMateria = (materia_curso_id: string, trimestre_id: string) =>
    ejecutarDescarga(
      () => reportesService.descargarReporteMateria(materia_curso_id, trimestre_id),
      'Generando reporte de materia...',
      'Reporte descargado exitosamente',
      'reporte-materia'
    );

  // Reporte consolidado de calificaciones por curso (generada por tutor)  
  const descargarConcentradoCalificaciones = (curso_id: string, trimestre_id: string) =>
    ejecutarDescarga(
      () => reportesService.descargarConcentradoCalificaciones(curso_id, trimestre_id),
      'Generando concentrado...',
      'Concentrado descargado exitosamente',
      'concentrado'
    );

  // Reporte de insumos de materia (generada por docente)  
  const descargarReporteInsumos = (materia_curso_id: string, trimestre_id: string) =>
    ejecutarDescarga(
      () => reportesService.descargarReporteInsumos(materia_curso_id, trimestre_id),
      'Generando reporte de aportes...',
      'Reporte de aportes descargado',
      'reporte-insumos'
    );

  // Reporte de rendimiento anual de materia (generada por docente)  
  const descargarRendimientoAnual = (materia_curso_id: string, periodo_lectivo_id: string) =>
    ejecutarDescarga(
      () => reportesService.descargarRendimientoAnual(materia_curso_id, periodo_lectivo_id),
      'Generando rendimiento anual...',
      'Rendimiento anual descargado',
      'rendimiento-anual'
    );

  return {
    descargando,
    descargarLibretaIndividual,
    descargarLibretasCurso,
    descargarReporteMateria,
    descargarConcentradoCalificaciones,
    descargarReporteInsumos,
    descargarRendimientoAnual,
  };
};