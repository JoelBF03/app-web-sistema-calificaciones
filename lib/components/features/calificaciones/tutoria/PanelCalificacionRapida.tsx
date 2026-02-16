'use client';

import React from 'react';
import { Zap, CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { CalificacionComponente } from '@/lib/types/calificaciones.types';
import { ComponenteCualitativo } from '@/lib/types/calificaciones.types';

const SIN_CALIFICAR = '__SIN_CALIFICAR__';

const opcionesCalificacion = [
  { value: SIN_CALIFICAR, label: 'Sin calificar', color: 'text-gray-400' },
  { value: CalificacionComponente.MAS_A, label: '+A', color: 'text-green-700' },
  { value: CalificacionComponente.A, label: 'A', color: 'text-green-600' },
  { value: CalificacionComponente.A_MENOS, label: 'A-', color: 'text-green-500' },
  { value: CalificacionComponente.B_MAS, label: 'B+', color: 'text-blue-600' },
  { value: CalificacionComponente.B, label: 'B', color: 'text-blue-500' },
  { value: CalificacionComponente.B_MENOS, label: 'B-', color: 'text-blue-400' },
  { value: CalificacionComponente.C_MAS, label: 'C+', color: 'text-yellow-600' },
  { value: CalificacionComponente.C, label: 'C', color: 'text-yellow-500' },
  { value: CalificacionComponente.C_MENOS, label: 'C-', color: 'text-yellow-400' },
  { value: CalificacionComponente.D, label: 'D', color: 'text-red-600' },
];

interface PanelCalificacionRapidaProps {
  componentes: ComponenteCualitativo[];
  estudiantes: Array<{
    id: string;
    nombres_completos: string;
  }>;
  componenteSeleccionado: string;
  calificacionSeleccionada: string;
  estudiantesSeleccionados: Set<string>;
  notasTemp: Record<string, Record<string, CalificacionComponente | null>>;
  estadoFinalizado: boolean;
  isAdmin: boolean;
  onComponenteChange: (value: string) => void;
  onCalificacionChange: (value: string) => void;
  onEstudianteToggle: (estudianteId: string) => void;
  onToggleTodos: () => void;
  onAplicarCalificacion: () => void;
}

export function PanelCalificacionRapida({
  componentes,
  estudiantes,
  componenteSeleccionado,
  calificacionSeleccionada,
  estudiantesSeleccionados,
  notasTemp,
  estadoFinalizado,
  isAdmin,
  onComponenteChange,
  onCalificacionChange,
  onEstudianteToggle,
  onToggleTodos,
  onAplicarCalificacion,
}: PanelCalificacionRapidaProps) {
  return (
    <Card className="border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-pink-600" />
          Calificación Rápida por Componente
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Selecciona un componente y una calificación, luego elige los estudiantes para aplicar masivamente
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selectores de Componente y Calificación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Seleccionar Componente */}
          <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                componenteSeleccionado ? 'bg-purple-500' : 'bg-gray-300'
              }`}>
                <CheckCircle2 className={`w-5 h-5 ${
                  componenteSeleccionado ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <label className="text-sm font-semibold text-gray-900">
                Componente a calificar
              </label>
            </div>
            <Select value={componenteSeleccionado} onValueChange={onComponenteChange}>
              <SelectTrigger className="h-11 border-2">
                <SelectValue placeholder="Selecciona el componente..." />
              </SelectTrigger>
              <SelectContent>
                {componentes.map((componente) => (
                  <SelectItem key={componente.id} value={componente.id}>
                    {componente.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleccionar Calificación */}
          <div className="bg-white rounded-lg p-4 border-2 border-pink-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                calificacionSeleccionada ? 'bg-pink-500' : 'bg-gray-300'
              }`}>
                <CheckCircle2 className={`w-5 h-5 ${
                  calificacionSeleccionada ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <label className="text-sm font-semibold text-gray-900">
                Calificación a asignar
              </label>
            </div>
            <Select value={calificacionSeleccionada} onValueChange={onCalificacionChange}>
              <SelectTrigger className="h-11 border-2">
                <SelectValue placeholder="Selecciona la calificación..." />
              </SelectTrigger>
              <SelectContent>
                {opcionesCalificacion.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className={opt.color}>{opt.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Estudiantes */}
        <div className="bg-white rounded-lg border-2 border-purple-200 shadow-sm">
          <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  estudiantesSeleccionados.size > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Users className={`w-5 h-5 ${
                    estudiantesSeleccionados.size > 0 ? 'text-white' : 'text-gray-500'
                  }`} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-900 block">
                    Selecciona estudiantes
                  </label>
                  <p className="text-xs text-gray-600">
                    {estudiantesSeleccionados.size} de {estudiantes.length} seleccionados
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleTodos}
                className="text-xs border-2 hover:bg-purple-50"
              >
                {estudiantesSeleccionados.size === estudiantes.length ? 'Deseleccionar' : 'Seleccionar'} todos
              </Button>
            </div>
          </div>

          {/* Lista compacta de estudiantes */}
          <div className="max-h-72 overflow-y-auto p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {estudiantes.map((estudiante) => (
                <div
                  key={estudiante.id}
                  className={`flex items-center gap-2 p-2 rounded-md border-2 cursor-pointer transition-all ${
                    estudiantesSeleccionados.has(estudiante.id)
                      ? 'bg-purple-100 border-purple-400 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => onEstudianteToggle(estudiante.id)}
                >
                  <Checkbox
                    checked={estudiantesSeleccionados.has(estudiante.id)}
                    onCheckedChange={() => onEstudianteToggle(estudiante.id)}
                    className="cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {estudiante.nombres_completos}
                    </p>
                    {componenteSeleccionado && notasTemp[estudiante.id]?.[componenteSeleccionado] && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Actual: {notasTemp[estudiante.id][componenteSeleccionado]}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botón de acción destacado */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border-2 border-pink-300">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">¿Listo para aplicar?</p>
            <p className="text-xs text-gray-600">
              Se asignará <span className="font-semibold text-pink-700">{calificacionSeleccionada || '(ninguna)'}</span> a {estudiantesSeleccionados.size} estudiante(s)
              {componenteSeleccionado && componentes.find(c => c.id === componenteSeleccionado) && (
                <> en <span className="font-semibold text-purple-700">{componentes.find(c => c.id === componenteSeleccionado)?.nombre}</span></>
              )}
            </p>
          </div>
          <Button
            onClick={onAplicarCalificacion}
            disabled={!componenteSeleccionado || !calificacionSeleccionada || estudiantesSeleccionados.size === 0 || estadoFinalizado || isAdmin}
            size="lg"
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5 mr-2" />
            Aplicar Calificación
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}