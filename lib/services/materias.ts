import { api } from './api';
import { Materia, CreateMateriaDto, UpdateMateriaDto } from '../types/materia.types';

class MateriaService {
  private readonly BASE_PATH = '/materias';

  async create(data: CreateMateriaDto): Promise<Materia> {
    const response = await api.post<Materia>(this.BASE_PATH, data);
    return response.data;
  }

  async findAll(): Promise<Materia[]> {
    const response = await api.get<Materia[]>(this.BASE_PATH);
    return response.data;
  }

  async findOne(id: string): Promise<Materia> {
    const response = await api.get<Materia>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateMateriaDto): Promise<{ message: string; materia: Materia }> {
    const response = await api.put<{ message: string; materia: Materia }>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return response.data;
  }

  async cambiarEstado(id: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      `${this.BASE_PATH}/${id}/cambiar-estado`
    );
    return response.data;
  }
}

export const materiaService = new MateriaService();