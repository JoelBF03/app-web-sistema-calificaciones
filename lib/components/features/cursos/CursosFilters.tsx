'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/lib/components/ui/input';
import { Badge } from '@/lib/components/ui/badge';
import { EspecialidadCurso, EstadoCurso } from '@/lib/types/curso.types';

interface CursosFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  especialidadFilter: string;
  setEspecialidadFilter: (value: string) => void;
  estadoFilter: string;
  setEstadoFilter: (value: string) => void;
  onClearFilters: () => void;
  stats?: {
    totalCursos: number;
    cursosBasica: number;
    cursosTecnico: number;
    cursosCiencias: number;
  };
}

export default function CursosFilters({
  searchTerm,
  setSearchTerm,
  especialidadFilter,
  setEspecialidadFilter,
  estadoFilter,
  setEstadoFilter,
  onClearFilters,
  stats
}: CursosFiltersProps) {

  const hasActiveFilters = searchTerm !== '' || especialidadFilter !== 'all' || estadoFilter !== 'all';

  return (
    <div className="space-y-3">
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Buscar por nivel, paralelo o período..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11 pr-10 h-11 text-base"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        
        <Badge
          variant={especialidadFilter === 'all' ? 'default' : 'outline'}
          className="cursor-pointer px-4 py-2 text-sm font-medium flex items-center gap-2"
          onClick={() => setEspecialidadFilter('all')}
        >
          <span>Todas</span>
          {stats && (
            <span className={`${especialidadFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'} px-2 py-0.5 rounded-full text-xs font-bold`}>
              {stats.totalCursos}
            </span>
          )}
        </Badge>

        <div className="h-6 w-px bg-gray-300"></div>
        
        <Badge
          variant={especialidadFilter === EspecialidadCurso.BASICA ? 'default' : 'outline'}
          className={`cursor-pointer px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            especialidadFilter === EspecialidadCurso.BASICA 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : 'hover:bg-purple-50 border-purple-200'
          }`}
          onClick={() => setEspecialidadFilter(EspecialidadCurso.BASICA)}
        >
          <span>Básica</span>
          {stats && (
            <span className={`${especialidadFilter === EspecialidadCurso.BASICA ? 'bg-white/20' : 'bg-purple-100 text-purple-700'} px-2 py-0.5 rounded-full text-xs font-bold`}>
              {stats.cursosBasica}
            </span>
          )}
        </Badge>
        
        <Badge
          variant={especialidadFilter === EspecialidadCurso.TECNICO ? 'default' : 'outline'}
          className={`cursor-pointer px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            especialidadFilter === EspecialidadCurso.TECNICO 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'hover:bg-orange-50 border-orange-200'
          }`}
          onClick={() => setEspecialidadFilter(EspecialidadCurso.TECNICO)}
        >
          <span>Técnico</span>
          {stats && (
            <span className={`${especialidadFilter === EspecialidadCurso.TECNICO ? 'bg-white/20' : 'bg-orange-100 text-orange-700'} px-2 py-0.5 rounded-full text-xs font-bold`}>
              {stats.cursosTecnico}
            </span>
          )}
        </Badge>
        
        <Badge
          variant={especialidadFilter === EspecialidadCurso.CIENCIAS ? 'default' : 'outline'}
          className={`cursor-pointer px-4 py-2 text-sm font-medium flex items-center gap-2 ${
            especialidadFilter === EspecialidadCurso.CIENCIAS 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'hover:bg-green-50 border-green-200'
          }`}
          onClick={() => setEspecialidadFilter(EspecialidadCurso.CIENCIAS)}
        >
          <span>Ciencias</span>
          {stats && (
            <span className={`${especialidadFilter === EspecialidadCurso.CIENCIAS ? 'bg-white/20' : 'bg-green-100 text-green-700'} px-2 py-0.5 rounded-full text-xs font-bold`}>
              {stats.cursosCiencias}
            </span>
          )}
        </Badge>

        <div className="h-6 w-px bg-gray-300"></div>

        <div className="flex gap-2">
          <Badge
            variant={estadoFilter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer px-3 py-2 text-sm font-medium"
            onClick={() => setEstadoFilter('all')}
          >
            Todos
          </Badge>
          <Badge
            variant={estadoFilter === EstadoCurso.ACTIVO ? 'default' : 'outline'}
            className={`cursor-pointer px-3 py-2 text-sm font-medium ${
              estadoFilter === EstadoCurso.ACTIVO 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'hover:bg-green-50 border-green-200'
            }`}
            onClick={() => setEstadoFilter(EstadoCurso.ACTIVO)}
          >
            Activos
          </Badge>
          <Badge
            variant={estadoFilter === EstadoCurso.INACTIVO ? 'default' : 'outline'}
            className={`cursor-pointer px-3 py-2 text-sm font-medium ${
              estadoFilter === EstadoCurso.INACTIVO 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'hover:bg-red-50 border-red-200'
            }`}
            onClick={() => setEstadoFilter(EstadoCurso.INACTIVO)}
          >
            Inactivos
          </Badge>
        </div>

        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          </>
        )}
      </div>
    </div>
  );
}