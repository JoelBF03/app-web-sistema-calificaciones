'use client';

import Image from 'next/image';
import { Docente, NivelAsignado } from '@/lib/types/docente.types';
import { Role, Estado } from '@/lib/types/usuario.types';
import { Crown, Globe2, GraduationCap, BookOpen, Mail, Phone, Eye, Edit, Power, AlertCircle, IdCard } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent } from '@/lib/components/ui/card';

interface DocenteCardProps {
  docente: Docente;
  onViewDetails: (docenteId: string) => void;
  onEdit: (docenteId: string) => void;
  onToggleStatus: (docenteId: string) => void;
}

export default function DocenteCard({ 
  docente, 
  onViewDetails, 
  onEdit, 
  onToggleStatus 
}: DocenteCardProps) {

  const isActive = docente.usuario_id.estado === Estado.ACTIVO;

  const renderRoleIcon = () => {
    if (docente.usuario_id.rol === Role.ADMIN)
      return <Crown className="w-6 h-6 text-white" />;

    switch (docente.nivelAsignado) {
      case NivelAsignado.GLOBAL:
        return <Globe2 className="w-6 h-6 text-white" />;
      case NivelAsignado.BASICA:
        return <BookOpen className="w-6 h-6 text-white" />;
      case NivelAsignado.BACHILLERATO:
        return <GraduationCap className="w-6 h-6 text-white" />;
      default:
        return <BookOpen className="w-6 h-6 text-white" />;
    }
  };

  const getNivelColor = () => {
    if (!isActive) return "from-slate-400 to-slate-500";

    switch (docente.nivelAsignado) {
      case NivelAsignado.BASICA:
        return "from-slate-500 to-slate-600";
      case NivelAsignado.BACHILLERATO:
        return "from-indigo-500 to-indigo-600";
      case NivelAsignado.GLOBAL:
        return "from-teal-500 to-teal-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const getNivelText = () => {
    switch (docente.nivelAsignado) {
      case NivelAsignado.BASICA: return "Educación Básica";
      case NivelAsignado.BACHILLERATO: return "Bachillerato";
      case NivelAsignado.GLOBAL: return "Global";
      default: return "Docente";
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        !isActive && 'opacity-75'
      }`}
    >
      <div className={`bg-gradient-to-r ${getNivelColor()} px-4 py-3 text-white relative`}>
        <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white text-[10px] px-2 py-0.5"
          >
            {isActive ? Estado.ACTIVO : Estado.INACTIVO}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white flex-shrink-0">
            <img
              width={48}
              height={48}
              src={docente.foto_perfil_url || "/iconUser.png"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base leading-tight truncate">
              {docente.nombres}
            </p>
            <p className="font-semibold text-base leading-tight truncate">
              {docente.apellidos}
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs opacity-90">
              <div className="w-6 h-6 bg-white/25 rounded-md flex items-center justify-center">
                {renderRoleIcon()}
              </div>
              <span className="font-medium">{getNivelText()}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2.5">
          <div className="flex items-start gap-2 text-[15px] text-gray-700">
            <Mail className="w-[18px] h-[18px] mt-0.5 text-blue-600 flex-shrink-0" />
            <span className="line-clamp-2 break-all leading-snug">
              {docente.usuario_id.email}
            </span>
          </div>

          {docente.telefono && (
            <div className="flex items-center gap-2 text-[15px] text-gray-700">
              <Phone className="w-[18px] h-[18px] text-green-600 flex-shrink-0" />
              <span>{docente.telefono}</span>
            </div>
          )}

          {docente.cedula && (
            <div className="flex items-center gap-2 text-[15px] text-gray-700">
              <IdCard className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" />
              <span>{docente.cedula}</span>
            </div>
          )}
        </div>

        {!docente.perfil_completo && (
          <div className="bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 flex items-center gap-2 mt-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-800">
              Perfil incompleto
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Button
            onClick={() => onViewDetails(docente.id)}
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => onEdit(docente.id)}
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => onToggleStatus(docente.id)}
            variant={isActive ? "destructive" : "default"}
            size="sm"
            className="cursor-pointer"
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}