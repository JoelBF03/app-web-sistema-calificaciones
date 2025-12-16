// nextjs-frontend/lib/components/features/docentes/DocenteDetailsModal.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  User,
  Mail,
  Phone,
  IdCard,
  Shield,
  UserCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar
} from 'lucide-react';

import { useDocentes } from '@/lib/hooks/useDocentes';
import { Docente, NivelAsignado } from '@/lib/types/docente.types';
import { Estado } from '@/lib/types/usuario.types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Label } from '@/lib/components/ui/label';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

interface DocenteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  docenteId: string | null;
}

export default function DocenteDetailsModal({
  isOpen,
  onClose,
  docenteId
}: DocenteDetailsModalProps) {
  const { obtenerDocente } = useDocentes();

  const [docente, setDocente] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && docenteId) {
      loadDocente();
    }
  }, [isOpen, docenteId]);

  const loadDocente = async () => {
    if (!docenteId) return;

    setLoading(true);
    setError('');

    try {
      const data = await obtenerDocente(docenteId);
      setDocente(data);
    } catch {
      setError('Error al cargar los detalles del docente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDocente(null);
    setError('');
    onClose();
  };

  const getNivelColor = () => {
    if (!docente) return "from-slate-400 to-slate-500";
    
    const isActive = docente?.usuario_id?.estado === Estado.ACTIVO;
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

  const isActive = docente?.usuario_id?.estado === Estado.ACTIVO;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">

        {/* Header accesible */}
        <DialogHeader className="sr-only">
          <DialogTitle>Detalles del Docente</DialogTitle>
          <DialogDescription>
            Información detallada del docente seleccionado
          </DialogDescription>
        </DialogHeader>

        {/* Loading */}
        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando información del docente...</p>
          </div>
        )}

        {/* Error */}
        {error && !docente && (
          <div className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={handleClose} variant="destructive">
              Cerrar
            </Button>
          </div>
        )}

        {/* Content */}
        {docente && (
          <>
            {/* Header visual */}
            <div className={`bg-gradient-to-r ${getNivelColor()} text-white p-6`}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img
                    src={docente.foto_perfil_url || '/vercel.svg'}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Eye className="w-6 h-6" />
                    {docente.nombres} {docente.apellidos}
                  </h2>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className="bg-white/20">{docente.nivelAsignado}</Badge>
                    <Badge variant={isActive ? 'default' : 'secondary'} className="bg-white/20">
                      {isActive ? Estado.ACTIVO : Estado.INACTIVO}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">

              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <InfoField label="Nombres" value={docente.nombres} icon={<User className="w-4 h-4" />} />
                  <InfoField label="Apellidos" value={docente.apellidos} icon={<User className="w-4 h-4" />} />
                  <InfoField label="Cédula" value={docente.cedula} icon={<IdCard className="w-4 h-4" />} />
                  <InfoField label="Teléfono" value={docente.telefono || 'No registrado'} icon={<Phone className="w-4 h-4" />} />
                </CardContent>
              </Card>

              {/* Información de Usuario */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Información de Acceso
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <InfoField label="Email" value={docente.usuario_id.email} icon={<Mail className="w-4 h-4" />} />
                  <InfoField label="Rol" value={docente.usuario_id.rol} icon={<Shield className="w-4 h-4" />} />
                </CardContent>
              </Card>

              {/* Fechas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Auditoría
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <InfoField label="Creado" value={new Date(docente.createdAt).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
                  <InfoField label="Última actualización" value={new Date(docente.updatedAt).toLocaleDateString()} icon={<Calendar className="w-4 h-4" />} />
                </CardContent>
              </Card>

              {!docente.perfil_completo && (
                <Alert>
                  <AlertDescription>
                    El docente aún no ha completado su perfil
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const InfoField = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div>
    <Label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
      {icon}
      {label}
    </Label>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);