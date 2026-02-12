import { useState } from 'react';
import { materiaCursoService } from '../services/materia-curso';
import {
  MateriaCurso,
  CreateMateriaCursoDto,
  UpdateMateriaCursoDto,
  MateriaCursoByCursoResponse,
  MateriaCursoByDocenteResponse,
  MateriaCursoByMateriaResponse,
  MateriaCursoByPeriodoResponse,
  EstadoMateriaCurso,
} from '../types/materia-curso.types';
import { toast } from 'sonner';

export const useMateriaCurso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crearMateriaCurso = async (data: CreateMateriaCursoDto): Promise<MateriaCurso | null> => {
    setLoading(true);
    setError(null);
    try {
      const materiaCurso = await materiaCursoService.create(data);
      return materiaCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al crear materia-curso';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const obtenerTodasMateriaCurso = async (): Promise<MateriaCurso[]> => {
    setLoading(true);
    setError(null);
    try {
      const materiasCurso = await materiaCursoService.findAll();
      return materiasCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al obtener materias-curso';
      setError(mensaje);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const obtenerMateriaCurso = async (id: string): Promise<MateriaCurso | null> => {
    setLoading(true);
    setError(null);
    try {
      const materiaCurso = await materiaCursoService.findOne(id);
      return materiaCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al obtener materia-curso';
      setError(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerMateriasPorCurso = async (
    cursoId: string
  ): Promise<MateriaCursoByCursoResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await materiaCursoService.findByCurso(cursoId);
      return response;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al obtener materias del curso';
      setError(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerCargaDocente = async (
    docenteId: string
  ): Promise<MateriaCursoByDocenteResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await materiaCursoService.findByDocente(docenteId);
      return response;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al obtener carga del docente';
      setError(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerCursosPorMateria = async (
    materiaId: string
  ): Promise<MateriaCursoByMateriaResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await materiaCursoService.findByMateria(materiaId);
      return response;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al obtener cursos de la materia';
      setError(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerMateriaCursoPorPeriodo = async (
    periodoId: string
  ): Promise<MateriaCursoByPeriodoResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await materiaCursoService.findByPeriodo(periodoId);
      return response;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al obtener materias-curso del período';
      setError(mensaje);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarMateriaCurso = async (
    id: string,
    data: UpdateMateriaCursoDto
  ): Promise<MateriaCurso | null> => {
    setLoading(true);
    setError(null);
    try {
      const materiaCurso = await materiaCursoService.update(id, data);
      return materiaCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al actualizar materia-curso';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const asignarDocente = async (id: string, docenteId: string): Promise<MateriaCurso | null> => {
    setLoading(true);
    setError(null);
    try {
      const materiaCurso = await materiaCursoService.asignarDocente(id, docenteId);
      return materiaCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al asignar docente';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removerDocente = async (id: string): Promise<MateriaCurso | null> => {
    setLoading(true);
    setError(null);
    try {
      const materiaCurso = await materiaCursoService.removerDocente(id);
      return materiaCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al remover docente';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (
    id: string,
    nuevoEstado: EstadoMateriaCurso
  ): Promise<MateriaCurso | null> => {
    setLoading(true);
    setError(null);
    try {
      const materiaCurso = await materiaCursoService.cambiarEstado(id, nuevoEstado);
      return materiaCurso;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al cambiar estado';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarMateriaCurso = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await materiaCursoService.delete(id);
      return true;
    } catch (err: any) {
      const mensaje = err.response?.data?.message || err.message || 'Error al eliminar materia-curso';
      setError(mensaje);
      toast.error(mensaje);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    crearMateriaCurso,
    obtenerTodasMateriaCurso,
    obtenerMateriaCurso,
    obtenerMateriasPorCurso,
    obtenerCargaDocente,
    obtenerCursosPorMateria,
    obtenerMateriaCursoPorPeriodo,
    actualizarMateriaCurso,
    asignarDocente,
    removerDocente,
    cambiarEstado,
    eliminarMateriaCurso,
  };
};