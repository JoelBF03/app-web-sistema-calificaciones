// app/(protected)/admin/page.tsx
'use client';

import Link from 'next/link';
import {
  Users,
  Calendar,
  School,
  BookOpen,
  UserCircle,
  Link2,
  BarChart3,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/lib/components/ui/card';

export default function AdminDashboard() {
  const adminModules = [
    {
      title: 'Docentes',
      description: 'Gestionar docentes del sistema',
      icon: Users,
      href: '/admin/docentes',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Períodos Lectivos',
      description: 'Administrar años lectivos',
      icon: Calendar,
      href: '/admin/periodos',
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Cursos',
      description: 'Gestionar cursos y paralelos',
      icon: School,
      href: '/admin/cursos',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Materias',
      description: 'Administrar asignaturas',
      icon: BookOpen,
      href: '/admin/materias',
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
    },
    {
      title: 'Estudiantes',
      description: 'Gestionar alumnos matriculados',
      icon: UserCircle,
      href: '/admin/estudiantes',
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
      bgGradient: 'from-indigo-50 to-indigo-100',
    },
    {
      title: 'Asignaciones',
      description: 'Asignar materias a cursos',
      icon: Link2,
      href: '/admin/asignaciones',
      color: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
    },
    {
      title: 'Reportes',
      description: 'Generar reportes del sistema',
      icon: BarChart3,
      href: '/admin/reportes',
      color: 'text-teal-600',
      gradient: 'from-teal-500 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100',
    },
    {
      title: 'Matrículas',
      description: 'Matricular estudiantes',
      icon: FileText,
      href: '/admin/matriculas',
      color: 'text-gray-600',
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">
          Panel de Administración
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gestione todos los aspectos del sistema educativo desde este panel centralizado
        </p>
      </div>

      {/* Módulos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {adminModules.map((module) => {
          const IconComponent = module.icon;
          
          return (
            <Link
              key={module.href}
              href={module.href}
              className="group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${module.gradient}`} />
                
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className={`mb-4 p-4 rounded-xl bg-gradient-to-br ${module.bgGradient} w-fit group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-8 w-8 ${module.color}`} strokeWidth={2} />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Action Indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 flex items-center gap-2 transition-colors">
                      Acceder
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}