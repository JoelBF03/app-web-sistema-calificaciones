import { useState } from 'react';
import { toast } from 'sonner';
import { reportesService } from '@/lib/services/reportes.services';

export const useReportes = () => {
  const [descargando, setDescargando] = useState(false);

  const descargarLibretaIndividual = async (
    estudiante_id: string,
    estudiante_nombre: string,
    trimestre_id: string
  ) => {
    try {
      setDescargando(true);
      toast.loading('Generando libreta...', { id: 'libreta-individual' });

      const blob = await reportesService.descargarLibretaIndividual(
        estudiante_id,
        trimestre_id
      );

      const nombreArchivo = `Libreta_${estudiante_nombre.replace(/\s+/g, '_')}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Libreta descargada exitosamente', { id: 'libreta-individual' });
    } catch (error: any) {
      console.error('Error al descargar libreta:', error);
      toast.error(
        error.response?.data?.message || 'Error al descargar la libreta',
        { id: 'libreta-individual' }
      );
    } finally {
      setDescargando(false);
    }
  };

  const descargarLibretasCurso = async (
    curso_id: string,
    curso_nombre: string,
    trimestre_id: string,
    trimestre_nombre: string
  ) => {
    try {
      setDescargando(true);
      toast.loading('Generando libretas del curso... Esto puede tardar un momento.', {
        id: 'libretas-curso',
      });

      const blob = await reportesService.descargarLibretasCursoConsolidado(
        curso_id,
        trimestre_id
      );

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Libretas_${curso_nombre}_${trimestre_nombre}_${fecha}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Libretas del curso descargadas exitosamente', {
        id: 'libretas-curso',
      });
    } catch (error: any) {
      console.error('Error al descargar libretas del curso:', error);
      toast.error(
        error.response?.data?.message || 'Error al descargar las libretas',
        { id: 'libretas-curso' }
      );
    } finally {
      setDescargando(false);
    }
  };

  const descargarReporteMateria = async (
    materia_curso_id: string,
    materia_nombre: string,
    trimestre_id: string,
    trimestre_nombre: string
  ) => {
    try {
      setDescargando(true);
      toast.loading('Generando reporte de materia...', { id: 'reporte-materia' });

      const blob = await reportesService.descargarReporteMateria(
        materia_curso_id,
        trimestre_id
      );

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Reporte_${materia_nombre}_${trimestre_nombre}_${fecha}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Reporte descargado exitosamente', { id: 'reporte-materia' });
    } catch (error: any) {
      console.error('Error al descargar reporte:', error);
      toast.error(
        error.response?.data?.message || 'Error al descargar el reporte',
        { id: 'reporte-materia' }
      );
    } finally {
      setDescargando(false);
    }
  };

  const descargarConcentradoCalificaciones = async (
    curso_id: string,
    curso_nombre: string,
    trimestre_id: string,
    trimestre_nombre: string
  ) => {
    try {
      setDescargando(true);
      toast.loading('Generando concentrado de calificaciones...', {
        id: 'concentrado-calificaciones',
      });

      const blob = await reportesService.descargarConcentradoCalificaciones(
        curso_id,
        trimestre_id
      );

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Concentrado_${curso_nombre}_${trimestre_nombre}_${fecha}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Concentrado descargado exitosamente', {
        id: 'concentrado-calificaciones',
      });
    } catch (error: any) {
      console.error('Error al descargar concentrado:', error);
      toast.error(
        error.response?.data?.message || 'Error al descargar el concentrado',
        { id: 'concentrado-calificaciones' }
      );
    } finally {
      setDescargando(false);
    }
  };

  const descargarReporteInsumos = async (
    materia_curso_id: string,
    materia_nombre: string,
    trimestre_id: string,
    trimestre_nombre: string
  ) => {
    try {
      setDescargando(true);
      toast.loading('Generando reporte de aportes...', { id: 'reporte-insumos' });

      const blob = await reportesService.descargarReporteInsumos(
        materia_curso_id,
        trimestre_id
      );

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Aportes_${materia_nombre}_${trimestre_nombre}_${fecha}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Reporte de aportes descargado exitosamente', { id: 'reporte-insumos' });
    } catch (error: any) {
      console.error('Error al descargar reporte de insumos:', error);
      toast.error(
        error.response?.data?.message || 'Error al descargar el reporte',
        { id: 'reporte-insumos' }
      );
    } finally {
      setDescargando(false);
    }
  };

  const descargarRendimientoAnual = async (
    materia_curso_id: string,
    materia_nombre: string,
    periodo_lectivo_id: string,
    periodo_nombre: string
  ) => {
    try {
      setDescargando(true);
      toast.loading('Generando reporte de rendimiento anual...', {
        id: 'rendimiento-anual'
      });

      const blob = await reportesService.descargarRendimientoAnual(
        materia_curso_id,
        periodo_lectivo_id
      );

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Rendimiento_Anual_${materia_nombre}_${periodo_nombre}_${fecha}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Reporte de rendimiento anual descargado exitosamente', {
        id: 'rendimiento-anual'
      });
    } catch (error: any) {
      console.error('Error al descargar reporte de rendimiento anual:', error);
      toast.error(
        error.response?.data?.message || 'Error al descargar el reporte',
        { id: 'rendimiento-anual' }
      );
    } finally {
      setDescargando(false);
    }
  };

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