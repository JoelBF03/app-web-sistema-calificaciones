import { Search, Filter, ClipboardCheck, GraduationCap } from 'lucide-react';
import { Card } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import { EstadoEstudiante } from '@/lib/types/estudiante.types';
import { useEffect, useState } from 'react';
import { cursosService } from '@/lib/services/cursos';
import { EstadoCurso } from '@/lib/types';
import { toast } from 'sonner';

interface FiltrosEstudiantesProps {
  filtros: {
    search: string;
    estado: EstadoEstudiante | 'ALL';
    incompletos: 'ALL' | 'true' | 'false';
    nivelCurso?: string;
  };
  onFiltrosChange: (filtros: any) => void;
}

export function FiltrosEstudiantes({ filtros, onFiltrosChange }: FiltrosEstudiantesProps) {
  const [nivelesCurso, setNivelesCurso] = useState<string[]>([]);
  const [loadingNiveles, setLoadingNiveles] = useState(false);

  useEffect(() => {
    const cargarNiveles = async () => {
      try {
        setLoadingNiveles(true);
        const cursosData = await cursosService.findAll();

        const nivelesUnicos = [...new Set(
          cursosData
            .filter(curso => curso.estado === EstadoCurso.ACTIVO)
            .map(curso => curso.nivel)
        )].sort();

        setNivelesCurso(nivelesUnicos);
      } catch (error) {
        toast.error('Error al cargar niveles de curso');
      } finally {
        setLoadingNiveles(false);
      }
    };

    cargarNiveles();
  }, []);

  const formatearNivelCurso = (nivel: string): string => {
    return nivel
      .split('_')
      .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4" />
              Buscar Estudiante
            </Label>
            <Input
              type="text"
              placeholder="Buscar por cédula, nombre o email..."
              value={filtros.search}
              onChange={(e) => onFiltrosChange({ ...filtros, search: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4" />
              Estado
            </Label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => onFiltrosChange({ ...filtros, estado: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value={EstadoEstudiante.ACTIVO}>Activos</SelectItem>
                <SelectItem value={EstadoEstudiante.SIN_MATRICULA}>Sin Matrícula</SelectItem>
                <SelectItem value={EstadoEstudiante.INACTIVO_TEMPORAL}>Inactivos Temporales</SelectItem>
                <SelectItem value={EstadoEstudiante.GRADUADO}>Graduados</SelectItem>
                <SelectItem value={EstadoEstudiante.RETIRADO}>Retirados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-4 h-4" />
              Datos
            </Label>
            <Select
              value={filtros.incompletos}
              onValueChange={(value) => onFiltrosChange({ ...filtros, incompletos: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="false">✓ Completos</SelectItem>
                <SelectItem value="true">⚠ Incompletos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}