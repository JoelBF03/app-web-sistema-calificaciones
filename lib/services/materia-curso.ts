import { api } from './api';
import {
  MateriaCurso,
  CreateMateriaCursoDto,
  UpdateMateriaCursoDto,
  MateriaCursoByCursoResponse,
  MateriaCursoByDocenteResponse,
  MateriaCursoByMateriaResponse,
  MateriaCursoByPeriodoResponse,
  EstadoMateriaCurso,
  MateriasDocenteResponse
} from '../types/materia-curso.types';

class MateriaCursoService {

  async create(data: CreateMateriaCursoDto): Promise<MateriaCurso> {
    const response = await api.post('/materia-curso', data);
    return response.data;
  }

  async findAll(): Promise<MateriaCurso[]> {
    const response = await api.get('/materia-curso');
    return response.data;
  }

  async findOne(id: string): Promise<MateriaCurso> {
    const response = await api.get(`/materia-curso/${id}`);
    return response.data;
  }

  async findByCurso(cursoId: string): Promise<MateriaCursoByCursoResponse> {
    const response = await api.get(
      `/materia-curso/curso/${cursoId}`
    );
    return response.data;
  }

  async findByDocente(docenteId: string): Promise<MateriaCursoByDocenteResponse> {
    const response = await api.get(
      `/materia-curso/docente/${docenteId}`
    );
    return response.data;
  }

  async findByMateria(materiaId: string): Promise<MateriaCursoByMateriaResponse> {
    const response = await api.get(
      `/materia-curso/materia/${materiaId}`
    );
    return response.data;
  }

  async findByPeriodo(periodoId: string): Promise<MateriaCursoByPeriodoResponse> {
    const response = await api.get(
      `/materia-curso/periodo/${periodoId}`
    );
    return response.data;
  }

  async update(id: string, data: UpdateMateriaCursoDto): Promise<MateriaCurso> {
    const response = await api.put(`/materia-curso/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/materia-curso/${id}`);
    return response.data;
  }

  async asignarDocente(id: string, docenteId: string): Promise<MateriaCurso> {
    return this.update(id, { docente_id: docenteId });
  }

  async removerDocente(id: string): Promise<MateriaCurso> {
    return this.update(id, { docente_id: null });
  }

  async cambiarEstado(id: string, nuevoEstado: EstadoMateriaCurso): Promise<MateriaCurso> {
    return this.update(id, { estado: nuevoEstado });
  }

  async getByDocente(docenteId: string): Promise<MateriaCursoByDocenteResponse> {
    const response = await api.get(`/materia-curso/docente/${docenteId}`);
    return response.data;
  }

  async getByCurso(cursoId: string): Promise<MateriaCurso[]> {
    const response = await api.get(`/materia-curso/curso/${cursoId}`);
    return response.data;
  }
}

export const materiaCursoService = new MateriaCursoService();