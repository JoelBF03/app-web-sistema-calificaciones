'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, User, Mail, Phone, IdCard, Key, FileText, AlertTriangle, Save, Loader2, Shield, UserCircle } from 'lucide-react';

import { useDocentes } from '@/lib/hooks/useDocentes';
import { useUsuarios } from '@/lib/hooks/useUsuarios';
import { Docente, UpdateDocenteData, NivelAsignado } from '@/lib/types/docente.types';
import { Role } from '@/lib/types/usuario.types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';

interface DocenteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  docenteId: string | null;
  onSuccess?: () => void;
}

export default function DocenteEditModal({ 
  isOpen, 
  onClose, 
  docenteId, 
  onSuccess 
}: DocenteEditModalProps) {
  const { obtenerDocente, actualizarDocente } = useDocentes();
  const { cambiarRol, resetearPassword, actualizarEmail } = useUsuarios();

  const [docente, setDocente] = useState<Docente | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<UpdateDocenteData>({
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    nivelAsignado: NivelAsignado.BASICA,
    foto_perfil_url: '',
    foto_titulo_url: ''
  });

  const [userFormData, setUserFormData] = useState({
    email: '',
    rol: Role.DOCENTE,
    newPassword: ''
  });

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
      
      setFormData({
        nombres: data.nombres,
        apellidos: data.apellidos,
        cedula: data.cedula || '',
        telefono: data.telefono || '',
        nivelAsignado: data.nivelAsignado,
        foto_perfil_url: data.foto_perfil_url || '',
        foto_titulo_url: data.foto_titulo_url || ''
      });

      setUserFormData({
        email: data.usuario_id.email,
        rol: data.usuario_id.rol,
        newPassword: ''
      });
      
    } catch (error: any) {
      setError('Error al cargar los detalles del docente');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docenteId || !docente) return;

    setSaving(true);
    setError('');

    try {
      const cleanedFormData: any = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        nivelAsignado: formData.nivelAsignado,
      };

      if (formData.cedula?.trim()) cleanedFormData.cedula = formData.cedula.trim();
      if (formData.telefono?.trim()) cleanedFormData.telefono = formData.telefono.trim();
      if (formData.foto_perfil_url?.trim()) cleanedFormData.foto_perfil_url = formData.foto_perfil_url.trim();
      if (formData.foto_titulo_url?.trim()) cleanedFormData.foto_titulo_url = formData.foto_titulo_url.trim();

      await actualizarDocente(docenteId, cleanedFormData);

      if (userFormData.email !== docente.usuario_id.email) {
        await actualizarEmail(docente.usuario_id.id, { email: userFormData.email });
      }

      if (userFormData.rol !== docente.usuario_id.rol) {
        await cambiarRol(docente.usuario_id.id, userFormData.rol);
      }

      if (userFormData.newPassword.trim() && userFormData.newPassword.length >= 8) {
        await resetearPassword(docente.usuario_id.id, { newPassword: userFormData.newPassword.trim() });
      }

      onSuccess?.();
      handleClose();
      
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el docente');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setDocente(null);
    setError('');
    onClose();
  };

const getNivelColor = (nivelAsignado: string) => {
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


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Docente</DialogTitle>
          <DialogDescription>
            Formulario para editar la información del docente
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando información...</p>
          </div>
        ) : docente ? (
          <>
            {/* Header */}
            <div className={`bg-gradient-to-r ${getNivelColor(docente.nivelAsignado)} text-white p-6 rounded-t-lg`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-white flex-shrink-0">
                  <Image
                    width={64}
                    height={64}
                    src={formData.foto_perfil_url || docente.foto_perfil_url || "/vercel.svg"}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold leading-tight">
                    {docente.nombres} {docente.apellidos}
                  </h2>

                  <p className="text-white/90 text-sm">
                    Editar información del docente
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <form onSubmit={handleSave} className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Información Personal</TabsTrigger>
                  <TabsTrigger value="usuario">Usuario y Acceso</TabsTrigger>
                  <TabsTrigger value="documentos">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombres">
                        <User className="w-4 h-4 inline mr-1" />
                        Nombres *
                      </Label>
                      <Input
                        id="nombres"
                        value={formData.nombres}
                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apellidos">
                        <User className="w-4 h-4 inline mr-1" />
                        Apellidos *
                      </Label>
                      <Input
                        id="apellidos"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cedula">
                        <IdCard className="w-4 h-4 inline mr-1" />
                        Cédula
                      </Label>
                      <Input
                        id="cedula"
                        value={formData.cedula}
                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                        placeholder="0123456789"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="0987654321"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="nivelAsignado">
                        <Shield className="w-4 h-4 inline mr-1" />
                        Nivel Asignado *
                      </Label>
                      <Select
                        value={formData.nivelAsignado}
                        onValueChange={(value: NivelAsignado) => setFormData({ ...formData, nivelAsignado: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NivelAsignado.BASICA}>Educación Básica</SelectItem>
                          <SelectItem value={NivelAsignado.BACHILLERATO}>Bachillerato</SelectItem>
                          <SelectItem value={NivelAsignado.GLOBAL}>Global</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="usuario" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rol">
                        <UserCircle className="w-4 h-4 inline mr-1" />
                        Rol *
                      </Label>
                      <Select
                        value={userFormData.rol}
                        onValueChange={(value: Role) => setUserFormData({ ...userFormData, rol: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.DOCENTE}>Docente</SelectItem>
                          <SelectItem value={Role.ADMIN}>Administrador</SelectItem>
                          <SelectItem value={Role.SECRETARIA}>Secretaria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">
                        <Key className="w-4 h-4 inline mr-1" />
                        Nueva Contraseña (opcional)
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={userFormData.newPassword}
                        onChange={(e) => setUserFormData({ ...userFormData, newPassword: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                      />
                      <p className="text-xs text-gray-500">Dejar vacío para mantener la contraseña actual</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documentos" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="foto_perfil">
                        <FileText className="w-4 h-4 inline mr-1" />
                        URL Foto de Perfil
                      </Label>
                      <Input
                        id="foto_perfil"
                        value={formData.foto_perfil_url}
                        onChange={(e) => setFormData({ ...formData, foto_perfil_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="foto_titulo">
                        <FileText className="w-4 h-4 inline mr-1" />
                        URL Foto de Título
                      </Label>
                      <Input
                        id="foto_titulo"
                        value={formData.foto_titulo_url}
                        onChange={(e) => setFormData({ ...formData, foto_titulo_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}