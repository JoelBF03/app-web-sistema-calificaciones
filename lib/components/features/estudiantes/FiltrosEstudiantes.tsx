// nextjs-frontend/lib/components/features/estudiantes/FiltrosEstudiantes.tsx

import { Search, Filter, ClipboardCheck, GraduationCap, Calendar } from 'lucide-react';
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
import { periodosService } from '@/lib/services/periodos';
import { EspecialidadCurso, EstadoCurso, NivelCurso } from '@/lib/types';

interface FiltrosEstudiantesProps {
  filtros: {
    search: string;
    estado: EstadoEstudiante | 'ALL';
    incompletos: string;
    nivelCurso?: string;  // ✅ CAMBIADO: de cursoId a nivelCurso
    periodoId?: string;
  };
  onChange: (filtros: any) => void;
}

export function FiltrosEstudiantes({ filtros, onChange }: FiltrosEstudiantesProps) {
  const [nivelesCurso, setNivelesCurso] = useState<string[]>([]);  // ✅ CAMBIADO
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [loadingNiveles, setLoadingNiveles] = useState(false);
  const [loadingPeriodos, setLoadingPeriodos] = useState(false);

  // ✅ Cargar niveles únicos de cursos activos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingNiveles(true);
        setLoadingPeriodos(true);

        const [cursosData, periodosData] = await Promise.all([
          cursosService.findAll(),
          periodosService.getAll(),
        ]);

        // ✅ Extraer niveles únicos de cursos activos
        const nivelesUnicos = [...new Set(
          cursosData
            .filter(curso => curso.estado === EstadoCurso.ACTIVO)
            .map(curso => curso.nivel)
        )].sort();  // Ordenar alfabéticamente

        console.log('🎓 Cursos cargados:', cursosData.length);
        console.log('🎓 Cursos activos:', cursosData.filter(c => c.estado === EstadoCurso.ACTIVO).length);
        console.log('🎓 Niveles únicos extraídos:', nivelesUnicos);


        setNivelesCurso(nivelesUnicos);
        setPeriodos(periodosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoadingNiveles(false);
        setLoadingPeriodos(false);
      }
    };

    cargarDatos();
  }, []);

  // ✅ Helper para formatear nombre del nivel
  const formatearNivelCurso = (nivel: string): string => {
    // Convertir "OCTAVO_EGB" → "Octavo EGB"
    return nivel
      .split('_')
      .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
      .join(' ');
  };

  console.log('📋 Filtros actuales:', filtros);
  console.log('📋 nivelCurso seleccionado:', filtros.nivelCurso);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Fila 1: Búsqueda */}
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
              onChange={(e) => onChange({ ...filtros, search: e.target.value })}
            />
          </div>
        </div>

        {/* Fila 2: Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Estado */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4" />
              Estado
            </Label>
            <Select
              value={filtros.estado}
              onValueChange={(value) => onChange({ ...filtros, estado: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">✓ Activos</SelectItem>
                <SelectItem value="SIN_MATRICULA">⏳ Sin Matrícula</SelectItem>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="GRADUADO">🎓 Graduados</SelectItem>
                <SelectItem value="RETIRADO">✗ Retirados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datos completos */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-4 h-4" />
              Datos
            </Label>
            <Select
              value={filtros.incompletos}
              onValueChange={(value) => onChange({ ...filtros, incompletos: value })}
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

          {/* Período Lectivo */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Período Lectivo
            </Label>
            <Select
              value={filtros.periodoId || 'ALL'}
              onValueChange={(value) => 
                onChange({ ...filtros, periodoId: value === 'ALL' ? undefined : value })
              }
              disabled={loadingPeriodos}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingPeriodos ? 'Cargando...' : 'Todos los períodos'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los períodos</SelectItem>
                {periodos.map((periodo) => (
                  <SelectItem key={periodo.id} value={periodo.id}>
                    {periodo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ✅ NUEVO: Nivel de Curso (sin paralelos) */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4" />
              Nivel de Curso
            </Label>
            <Select
              value={filtros.nivelCurso || 'ALL'}
              onValueChange={(value) => {
                console.log('🔄 Cambiando nivel a:', value);
                onChange({ ...filtros, nivelCurso: value === 'ALL' ? undefined : value })
              }}
              disabled={loadingNiveles}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingNiveles ? 'Cargando...' : 'Todos los niveles'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los niveles</SelectItem>
                {nivelesCurso.map((nivel) => (
                  <SelectItem key={nivel} value={nivel}>
                    {formatearNivelCurso(nivel)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}