import { api } from './api';
import type {
  Matricula,
  CreateMatriculaDto,
  ResumenImportacionDto,
  ResultadoImportacionDto,
  RegistroImportacionDto,
  UpdateMatriculaDto
} from '../types';

export const matriculasService = {

  async findAll(): Promise<Matricula[]> {
    const response = await api.get('/matriculas');
    return response.data;
  },

  async findOne(id: string): Promise<Matricula> {
    const response = await api.get(`/matriculas/${id}`);
    return response.data;
  },

  async create(data: CreateMatriculaDto): Promise<Matricula> {
    const response = await api.post('/matriculas', data);
    return response.data;
  },

  async update(id: string, data: UpdateMatriculaDto): Promise<Matricula> {
    const response = await api.put(`/matriculas/${id}`, data);
    return response.data;
  },

  async findByCurso(curso_id: string): Promise<Matricula[]> {
    const response = await api.get(`/matriculas/curso/${curso_id}`);
    return response.data;
  },  

  async descargarPlantilla(): Promise<Blob> {
    const response = await api.get('/matriculas/plantilla/descargar', {
      responseType: 'blob'
    });
    return response.data;
  },

  async subirArchivoImportacion(
    file: File,
    periodoId: string
  ): Promise<ResumenImportacionDto> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('periodo_id', periodoId);

    const response = await api.post('/matriculas/importar/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async confirmarImportacion(
    previewId: string,
    periodoId: string
  ): Promise<ResultadoImportacionDto> {
    const response = await api.post('/matriculas/importar/confirmar', {
      preview_id: previewId,
      periodo_id: periodoId
    });
    return response.data;
  },

  async remove(id: string, observaciones?: string): Promise<Matricula> {
    const response = await api.patch(`/matriculas/${id}/retirar`, { observaciones: observaciones ?? undefined });
    return response.data;
  },

  async reactivar(id: string): Promise<Matricula> {
    const response = await api.patch(`/matriculas/${id}/reactivar`);
    return response.data;
  } 
};