'use client';

import { X, BookOpen, Wrench, Calculator, Calendar, Hash, Users, Clock, CheckCircle, XCircle, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { Curso, NIVEL_DISPLAY_MAP, EspecialidadCurso, EstadoCurso } from '@/lib/types/curso.types';
import { EstadoPeriodo } from '@/lib/types/periodo.types';

import DocenteDetailsModal from '../docentes/DocenteDetailsModal';
import { useState } from 'react';

interface CursoDetailsModalProps {
  curso: Curso | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (curso: Curso) => void;
  onViewDocente?: (docente: Curso['docente']) => void;
  onViewMaterias?: (curso: Curso) => void; 
}

export default function CursoDetailsModal({
  curso,
  isOpen,
  onClose,
  onEdit,
  onViewDocente,
  onViewMaterias
}: CursoDetailsModalProps) {
  if (!isOpen || !curso) return null;

  const isActive = curso.estado === EstadoCurso.ACTIVO;

  const getEspecialidadConfig = (especialidad: EspecialidadCurso) => {
    switch (especialidad) {
      case EspecialidadCurso.BASICA:
        return {
          color: 'from-purple-500 to-purple-600', // ahora básica = morado (según petición previa)
          icon: <BookOpen className="w-6 h-6" />,
          bgLight: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-300'
        };
      case EspecialidadCurso.TECNICO:
        return {
          color: 'from-orange-500 to-orange-600', // técnico = naranja
          icon: <Wrench className="w-6 h-6" />,
          bgLight: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-300'
        };
      case EspecialidadCurso.CIENCIAS:
        return {
          color: 'from-green-500 to-green-600', // ciencias = verde
          icon: <Calculator className="w-6 h-6" />,
          bgLight: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-300'
        };
      default:
        return {
          color: 'from-gray-500 to-gray-600',
          icon: <BookOpen className="w-6 h-6" />,
          bgLight: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300'
        };
    }
  };

  const config = getEspecialidadConfig(curso.especialidad);

  // Helper para mostrar nombre completo del tutor con fallback
  const tutorNombre = curso.docente ? `${curso.docente.nombres} ${curso.docente.apellidos}`.trim() : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* HEADER */}
        <div className={`bg-gradient-to-r ${config.color} text-white p-5`}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/20">
              {config.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-tight">
                {NIVEL_DISPLAY_MAP[curso.nivel]} <span className="font-normal">- Paralelo</span> <span className="font-extrabold ml-1">{curso.paralelo}</span>
              </h2>
              <p className="text-white/90 text-sm mt-1">Detalles del curso</p>
            </div>

            <div className="flex items-start gap-3">
              <div className={`px-3 py-2 rounded-lg ${isActive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="flex items-center gap-2 text-white">
                  {isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span className="font-semibold text-sm">{isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="p-2 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LEFT: summary card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Resumen</CardTitle>
                <CardDescription className="text-xs">Información rápida del curso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgLight}`}>
                    <div className="text-xs text-gray-500">Nivel</div>
                    <div className={`text-lg font-bold ${config.textColor}`}>{NIVEL_DISPLAY_MAP[curso.nivel]}</div>
                  </div>

                  <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgLight}`}>
                    <div className="text-xs text-gray-500">Paralelo</div>
                    <div className={`text-2xl font-extrabold ${config.textColor}`}>{curso.paralelo}</div>
                  </div>

                  <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgLight}`}>
                    <div className="text-xs text-gray-500">Especialidad</div>
                    <div className={`text-lg font-bold ${config.textColor}`}>{curso.especialidad}</div>
                  </div>

                  <div className={`p-3 rounded-lg border ${config.borderColor} ${config.bgLight}`}>
                    <div className="text-xs text-gray-500">Estudiantes</div>
                    <div className={`text-2xl font-extrabold ${config.textColor}`}>{curso.estudiantes_matriculados || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT: details */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Período lectivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{curso.periodo_lectivo.nombre}</div>
                    </div>
                    <div>
                      <Badge variant={curso.periodo_lectivo.estado === EstadoPeriodo.ACTIVO ? 'default' : 'secondary'}>
                        {curso.periodo_lectivo.estado}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Creado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-900">
                      {format(new Date(curso.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{format(new Date(curso.createdAt), "HH:mm")}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Actualizado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-900">
                      {format(new Date(curso.updatedAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{format(new Date(curso.updatedAt), "HH:mm")}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tutor del curso</CardTitle>
                </CardHeader>
                <CardContent>
                  {tutorNombre ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{tutorNombre}</div>
                        <div className="text-xs text-gray-500 mt-1">{curso.docente?.usuario_id?.email || ''}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <div className="text-sm text-gray-500 italic">Sin tutor asignado</div>
                    </div>
                  )}

                  {/* Espacio para acción: ver/ir al tutor (opcional) */}
                  {curso.docente && (
                    <div className="mt-4">
                      <Button
                        className="cursor-pointer"
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDocente?.(curso.docente)}
                      >
                        <UserCircle className="w-4 h-4 mr-2" />
                        Ver Tutor
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="cursor-pointer"  >Cerrar</Button>
          {onViewMaterias && (
            <Button
              variant="outline"
              onClick={() => onViewMaterias(curso)}
              className="cursor-pointer"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Ver Materias
            </Button>
          )}
          {onEdit && (
            <Button
              onClick={() => {
                onEdit(curso);
                onClose();
              }}
              className={`bg-gradient-to-r ${config.color} hover:opacity-90 cursor-pointer`}
            >
              Editar Curso
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
