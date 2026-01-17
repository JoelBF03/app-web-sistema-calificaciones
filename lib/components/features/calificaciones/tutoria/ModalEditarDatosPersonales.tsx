'use client';

import { useState } from 'react';
import { X, User, Users, UserCheck, Save, Loader2 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';
import { toast } from 'sonner';
import { estudiantesService } from '@/lib/services/estudiantes';
import { EstadoEstudiante } from '@/lib/types';

interface ModalEditarDatosPersonalesProps {
  estudiante: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModalEditarDatosPersonales({
  estudiante,
  onClose,
  onSuccess,
}: ModalEditarDatosPersonalesProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('datos-personales');
  const [formData, setFormData] = useState({
    fecha_de_nacimiento: estudiante.fecha_de_nacimiento || '',
    direccion: estudiante.direccion || '',
    estado: estudiante.estado || EstadoEstudiante.ACTIVO,
    padre_nombre: estudiante.padre_nombre || '',
    padre_apellido: estudiante.padre_apellido || '',
    padre_cedula: estudiante.padre_cedula || '',
    madre_nombre: estudiante.madre_nombre || '',
    madre_apellido: estudiante.madre_apellido || '',
    madre_cedula: estudiante.madre_cedula || '',
    viven_juntos: estudiante.viven_juntos || false,
    representante_nombre: estudiante.representante_nombre || '',
    representante_apellido: estudiante.representante_apellido || '',
    representante_telefono: estudiante.representante_telefono || '',
    representante_telefono_auxiliar: estudiante.representante_telefono_auxiliar || '',
    representante_correo: estudiante.representante_correo || '',
    representante_parentesco: estudiante.representante_parentesco || '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Limpiar campos vacíos
      const dataLimpia: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          dataLimpia[key] = value;
        }
      });

      await estudiantesService.updateDatosPersonales(estudiante.id, dataLimpia);
      toast.success('Datos actualizados correctamente');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Datos Personales - {estudiante.nombres_completos}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-orange-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
            <div className="bg-gray-50 border-b px-6 sticky top-0 z-10">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="datos-personales" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Datos Personales
                </TabsTrigger>
                <TabsTrigger value="padres" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Padres
                </TabsTrigger>
                <TabsTrigger value="representante" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Representante
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab: Datos Personales */}
            <TabsContent value="datos-personales" className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CAMPOS NO EDITABLES POR TUTOR */}
                <div className="space-y-2">
                  <Label className="text-gray-500">Cédula (No editable)</Label>
                  <Input value={estudiante.estudiante_cedula} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">Nombre Completo (No editable)</Label>
                  <Input value={estudiante.nombres_completos} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">Email (No editable)</Label>
                  <Input value={estudiante.estudiante_email || 'Sin email'} disabled className="bg-gray-100" />
                </div>

                {/* CAMPOS EDITABLES */}
                <div className="space-y-2">
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.fecha_de_nacimiento}
                    onChange={(e) => handleChange('fecha_de_nacimiento', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección</Label>
                  <Input
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    placeholder="Ingrese la dirección"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado del Estudiante</Label>
                  <select
                    value={formData.estado || 'ACTIVO'}
                    onChange={(e) => handleChange('estado', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO_TEMPORAL">Inactivo Temporal</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    Los estudiantes inactivos temporales aparecen en gris y no pueden ser calificados
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Padres */}
            <TabsContent value="padres" className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Padre */}
                <div className="space-y-4 border-r pr-6">
                  <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Padre</h3>
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.padre_nombre}
                      onChange={(e) => handleChange('padre_nombre', e.target.value)}
                      placeholder="Nombre del padre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={formData.padre_apellido}
                      onChange={(e) => handleChange('padre_apellido', e.target.value)}
                      placeholder="Apellido del padre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula</Label>
                    <Input
                      value={formData.padre_cedula}
                      onChange={(e) => handleChange('padre_cedula', e.target.value)}
                      placeholder="Cédula del padre"
                    />
                  </div>
                </div>

                {/* Madre */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Madre</h3>
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={formData.madre_nombre}
                      onChange={(e) => handleChange('madre_nombre', e.target.value)}
                      placeholder="Nombre de la madre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={formData.madre_apellido}
                      onChange={(e) => handleChange('madre_apellido', e.target.value)}
                      placeholder="Apellido de la madre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula</Label>
                    <Input
                      value={formData.madre_cedula}
                      onChange={(e) => handleChange('madre_cedula', e.target.value)}
                      placeholder="Cédula de la madre"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={formData.viven_juntos}
                  onCheckedChange={(checked) => handleChange('viven_juntos', checked)}
                />
                <Label className="text-sm cursor-pointer">Los padres viven juntos</Label>
              </div>
            </TabsContent>

            {/* Tab: Representante */}
            <TabsContent value="representante" className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.representante_nombre}
                    onChange={(e) => handleChange('representante_nombre', e.target.value)}
                    placeholder="Nombre del representante"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    value={formData.representante_apellido}
                    onChange={(e) => handleChange('representante_apellido', e.target.value)}
                    placeholder="Apellido del representante"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono Principal</Label>
                  <Input
                    value={formData.representante_telefono}
                    onChange={(e) => handleChange('representante_telefono', e.target.value)}
                    placeholder="0999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono Auxiliar</Label>
                  <Input
                    value={formData.representante_telefono_auxiliar}
                    onChange={(e) => handleChange('representante_telefono_auxiliar', e.target.value)}
                    placeholder="0999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Correo</Label>
                  <Input
                    type="email"
                    value={formData.representante_correo}
                    onChange={(e) => handleChange('representante_correo', e.target.value)}
                    placeholder="representante@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parentesco</Label>
                  <Input
                    value={formData.representante_parentesco}
                    onChange={(e) => handleChange('representante_parentesco', e.target.value)}
                    placeholder="Ej: Padre, Madre, Tío, Abuelo"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer con botones */}
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white cursor-pointer"
            >
              {loading ? (
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
      </div>
    </div>
  );
}