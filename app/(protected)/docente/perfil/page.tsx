'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { ArrowLeft, User, Mail, Phone, Lock, Edit2, Check, X, Camera, Award, Loader2, IdCard } from 'lucide-react';
import { useDocentePerfil } from '@/lib/hooks/useDocentePerfil';
import { useAuthStore } from '@/lib/store/auth-store';
import { toast } from 'sonner';
import { CambiarPasswordModal } from '@/lib/components/features/docentes/CambiarPasswordModal';

export default function DocentePerfilPage() {
  const { usuario } = useAuthStore();
  const { docente, isLoading, actualizarPerfil } = useDocentePerfil();
  
  const [editando, setEditando] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [formData, setFormData] = useState({
    telefono: '',
    foto_perfil_url: '',
    foto_titulo_url: '',
  });

  useEffect(() => {
    if (docente) {
      setFormData({
        telefono: docente.telefono || '',
        foto_perfil_url: docente.foto_perfil_url || '',
        foto_titulo_url: docente.foto_titulo_url || '',
      });
    }
  }, [docente]);

  const handleGuardar = async () => {
    try {
      await actualizarPerfil(formData);
      setEditando(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Error al actualizar el perfil';
      toast.error(errorMsg);
    }
  };

  const handleCancelar = () => {
    if (docente) {
      setFormData({
        telefono: docente.telefono || '',
        foto_perfil_url: docente.foto_perfil_url || '',
        foto_titulo_url: docente.foto_titulo_url || '',
      });
    }
    setEditando(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header con fondo */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-gray-900">
                Mi Perfil
             </h1>
          </div>
        </div>

        {/* Contenedor principal con fondo */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Columna izquierda - Foto de perfil */}
            <Card className="md:col-span-1 border-2 border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="w-5 h-5 text-red-600" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar grande */}
                <div className="flex justify-center">
                  <div className="relative">
                    {formData.foto_perfil_url ? (
                      <img
                        src={formData.foto_perfil_url}
                        alt="Foto de perfil"
                        className="w-48 h-48 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-yellow-400 shadow-lg">
                        <User className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* URL de foto de perfil */}
                {editando && (
                  <div>
                    <Label className="text-sm font-semibold">URL de foto de perfil</Label>
                    <Input
                      value={formData.foto_perfil_url}
                      onChange={(e) => setFormData({ ...formData, foto_perfil_url: e.target.value })}
                      placeholder="https://ejemplo.com/foto.jpg"
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Foto de título */}
                <div className="pt-6 border-t-2 border-gray-100">
                  <Label className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Foto de Título Profesional
                  </Label>
                  {formData.foto_titulo_url ? (
                    <img
                      src={formData.foto_titulo_url}
                      alt="Título profesional"
                      className="w-full rounded-lg border-2 border-gray-200 shadow-md"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Award className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {editando && (
                    <Input
                      value={formData.foto_titulo_url}
                      onChange={(e) => setFormData({ ...formData, foto_titulo_url: e.target.value })}
                      placeholder="https://ejemplo.com/titulo.jpg"
                      className="mt-2"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Columna derecha - Información */}
            <div className="md:col-span-2 space-y-6">
              {/* Información Personal */}
              <Card className="border-2 border-gray-100">
                <CardHeader className="bg-gradient-to-r from-red-50 to-yellow-50 border-b-2 border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-red-600" />
                        Información Personal
                      </CardTitle>
                      <CardDescription>Datos personales y de contacto</CardDescription>
                    </div>
                    {!editando && (
                      <Button onClick={() => setEditando(true)} className="bg-red-600 hover:bg-red-700">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  {/* Email y Teléfono */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Email
                      </Label>
                      <Input
                        value={usuario?.email || ''}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No se puede modificar
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        Teléfono
                      </Label>
                      <Input
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        disabled={!editando}
                        className={!editando ? 'bg-gray-50 border-gray-200' : 'border-yellow-400 focus:ring-yellow-400'}
                        maxLength={10}
                        placeholder="0999999999"
                      />
                    </div>
                  </div>

                  {/* Nombres y Apellidos */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <User className="w-4 h-4 text-purple-600" />
                        Nombres
                      </Label>
                      <Input
                        value={docente?.nombres || ''}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No se puede modificar
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <User className="w-4 h-4 text-purple-600" />
                        Apellidos
                      </Label>
                      <Input
                        value={docente?.apellidos || ''}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No se puede modificar
                      </p>
                    </div>
                  </div>

                  {/* Cédula y Nivel */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <IdCard className="w-4 h-4 text-orange-600" />
                        Cédula
                      </Label>
                      <Input
                        value={docente?.cedula || ''}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No se puede modificar
                      </p>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        Nivel Asignado
                      </Label>
                      <Input
                        value={docente?.nivelAsignado || ''}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        No se puede modificar
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {editando && (
                    <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                      <Button
                        variant="outline"
                        onClick={handleCancelar}
                        className="flex-1 border-2"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleGuardar}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cambiar Contraseña */}
              <Card className="border-2 border-gray-100">
                <CardHeader className="bg-gradient-to-r from-red-50 to-yellow-50 border-b-2 border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lock className="w-5 h-5 text-red-600" />
                    Seguridad
                  </CardTitle>
                  <CardDescription>
                    Cambia tu contraseña para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button 
                    onClick={() => setModalPasswordOpen(true)}
                    className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambiar contraseña */}
      <CambiarPasswordModal 
        open={modalPasswordOpen}
        onOpenChange={setModalPasswordOpen}
      />
    </div>
  );
}