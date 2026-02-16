'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
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

interface TablaCalificacionManualProps {
  componentes: ComponenteCualitativo[];
  estudiantes: Array<{
    id: string;
    nombres_completos: string;
    estudiante: any;
  }>;
  notasTemp: Record<string, Record<string, CalificacionComponente | null>>;
  estadoFinalizado: boolean;
  isAdmin: boolean;
  isSaving: boolean;
  onNotaChange: (estudianteId: string, materiaId: string, value: string) => void;
  onEstudianteClick: (estudiante: any) => void;
}

export function TablaCalificacionManual({
  componentes,
  estudiantes,
  notasTemp,
  estadoFinalizado,
  isAdmin,
  isSaving,
  onNotaChange,
  onEstudianteClick,
}: TablaCalificacionManualProps) {
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="bg-gray-100 border-b-2 border-gray-400">
            <TableHead className="w-12 text-center font-bold border-r-2 border-gray-400">#</TableHead>
            <TableHead className="min-w-[250px] font-bold border-r-2 border-gray-400">Estudiante</TableHead>
            {componentes.map((componente) => (
              <TableHead
                key={componente.id}
                className="min-w-[140px] text-center font-bold border-r-2 border-gray-400"
              >
                {componente.nombre}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {estudiantes.map((estudiante, index) => (
            <TableRow
              key={estudiante.id}
              className={`border-b border-gray-300 hover:bg-purple-50 transition-colors ${
                isSaving ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <TableCell className="text-center font-medium border-r border-gray-300">
                {index + 1}
              </TableCell>
              <TableCell className="border-r border-gray-300">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => !isSaving && onEstudianteClick(estudiante.estudiante)}
                    title="Ver detalles del estudiante"
                  >
                    {estudiante.nombres_completos.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{estudiante.nombres_completos}</span>
                </div>
              </TableCell>
              {componentes.map((componente) => {
                const notaActual = notasTemp[estudiante.id]?.[componente.id] ?? null;
                const valorSelect = notaActual === null ? SIN_CALIFICAR : notaActual;

                return (
                  <TableCell key={componente.id} className="border-r border-gray-300 p-2">
                    <Select
                      value={valorSelect}
                      onValueChange={(value) => onNotaChange(estudiante.id, componente.id, value)}
                      disabled={estadoFinalizado || isAdmin || isSaving}
                    >
                      <SelectTrigger
                        className={`${valorSelect === SIN_CALIFICAR ? 'border-gray-300 text-gray-400' : 'border-purple-400 font-semibold'}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesCalificacion.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className={opt.color}>{opt.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}