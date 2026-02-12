import { useState } from 'react';
import { EstadoEstudiante, Estudiante, UpdateEstudianteDto } from '@/lib/types/estudiante.types';
import { X, User, Users, UserCheck, Save, Circle } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Checkbox } from '@/lib/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/lib/components/ui/select';
import { toast } from 'sonner';

interface ModalEditarEstudianteProps {
  estudiante: Estudiante;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateEstudianteDto) => Promise<void>;
}

export function ModalEditarEstudiante({
  estudiante,
  isOpen,
  onClose,
  onSave,
}: ModalEditarEstudianteProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('datos-personales');
  const [formData, setFormData] = useState<UpdateEstudianteDto>({
    estudiante_cedula: estudiante.estudiante_cedula,
    nombres_completos: estudiante.nombres_completos,
    estudiante_email: estudiante.estudiante_email || '',
    fecha_de_nacimiento: estudiante.fecha_de_nacimiento || '',
    direccion: estudiante.direccion || '',
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
    estado: estudiante.estado,
  });

  const handleChange = (field: keyof UpdateEstudianteDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataLimpia: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          dataLimpia[key] = value;
        }
      });

      await onSave(estudiante.id, dataLimpia);
      onClose();
    } catch (error) {
      toast.error('Error al editar estudiante');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Estudiante
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-green-800"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

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

            <div className="p-6 flex-1">
              {/* Datos Personales */}
              <TabsContent value="datos-personales" className="mt-0 space-y-6">
                <Card className="overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Datos Personales
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cedula">Cédula *</Label>
                      <Input
                        id="cedula"
                        value={formData.estudiante_cedula}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange('estudiante_cedula', value);
                        }}
                        placeholder="1234567890"
                        maxLength={10}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nombres">Nombre Completo *</Label>
                      <Input
                        id="nombres"
                        value={formData.nombres_completos}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                          handleChange('nombres_completos', value);
                        }}
                        placeholder="Juan Pérez García"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                      <Input
                        id="fecha_nacimiento"
                        type="date"
                        value={formData.fecha_de_nacimiento}
                        onChange={(e) => handleChange('fecha_de_nacimiento', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado" className="flex items-center gap-2">
                        <Circle className="w-4 h-4" />
                        Estado del Estudiante
                      </Label>
                      <Select
                        value={formData.estado || EstadoEstudiante.ACTIVO}
                        onValueChange={(value) => handleChange('estado', value as EstadoEstudiante)}
                      >
                        <SelectTrigger id="estado">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EstadoEstudiante.ACTIVO}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Activo
                            </span>
                          </SelectItem>
                          <SelectItem value={EstadoEstudiante.INACTIVO_TEMPORAL}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              Inactivo Temporal
                            </span>
                          </SelectItem>
                          <SelectItem value={EstadoEstudiante.SIN_MATRICULA}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              Sin Matrícula
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        • <strong>Activo:</strong> Estudiante puede ser calificado normalmente<br />
                        • <strong>Inactivo Temporal:</strong> Aparece en listas pero no se puede calificar (excluido de validaciones de cierre)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.estudiante_email}
                        onChange={(e) => handleChange('estudiante_email', e.target.value)}
                        placeholder="estudiante@email.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="direccion">Dirección</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleChange('direccion', e.target.value)}
                        placeholder="Calle Principal y Calle Secundaria"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Padres */}
              <TabsContent value="padres" className="mt-0 space-y-6">
                {/* Padre */}
                <Card className="overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Datos del Padre
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="padre_nombre">Nombre</Label>
                      <Input
                        id="padre_nombre"
                        value={formData.padre_nombre}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                          handleChange('padre_nombre', value);
                        }}
                        placeholder="Pedro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="padre_apellido">Apellido</Label>
                      <Input
                        id="padre_apellido"
                        value={formData.padre_apellido}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                          handleChange('padre_apellido', value);
                        }}
                        placeholder="Pérez"
                      />
                    </div>
                    <div>
                      <Label htmlFor="padre_cedula">Cédula</Label>
                      <Input
                        id="padre_cedula"
                        value={formData.padre_cedula}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange('padre_cedula', value);
                        }}
                        placeholder="1234567890"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </Card>

                {/* Madre */}
                <Card className="overflow-hidden">
                  <div className="bg-pink-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" />
                      Datos de la Madre
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="madre_nombre">Nombre</Label>
                        <Input
                          id="madre_nombre"
                          value={formData.madre_nombre}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                            handleChange('madre_nombre', value);
                          }}
                          placeholder="María"
                        />
                      </div>
                      <div>
                        <Label htmlFor="madre_apellido">Apellido</Label>
                        <Input
                          id="madre_apellido"
                          value={formData.madre_apellido}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                            handleChange('madre_apellido', value);
                          }}
                          placeholder="García"
                        />
                      </div>
                      <div>
                        <Label htmlFor="madre_cedula">Cédula</Label>
                        <Input
                          id="madre_cedula"
                          value={formData.madre_cedula}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                            handleChange('madre_cedula', value);
                          }}
                          placeholder="1234567890"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="viven_juntos"
                        checked={formData.viven_juntos}
                        onCheckedChange={(checked) => handleChange('viven_juntos', checked)}
                      />
                      <Label htmlFor="viven_juntos" className="cursor-pointer">
                        Los padres viven juntos
                      </Label>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Representante */}
              <TabsContent value="representante" className="mt-0 space-y-6">
                <Card className="overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      Datos del Representante
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="rep_nombre">Nombre</Label>
                      <Input
                        id="rep_nombre"
                        value={formData.representante_nombre}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                          handleChange('representante_nombre', value);
                        }}
                        placeholder="Pedro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rep_apellido">Apellido</Label>
                      <Input
                        id="rep_apellido"
                        value={formData.representante_apellido}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                          handleChange('representante_apellido', value);
                        }}
                        placeholder="Pérez"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rep_parentesco">Parentesco</Label>
                      <Input
                        id="rep_parentesco"
                        value={formData.representante_parentesco}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                          handleChange('representante_parentesco', value);
                        }}
                        placeholder="Padre, Madre, Tío, Abuela, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="rep_telefono">Teléfono Principal</Label>
                      <Input
                        id="rep_telefono"
                        value={formData.representante_telefono}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange('representante_telefono', value);
                        }}
                        placeholder="0999123456"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rep_telefono_aux">Teléfono Auxiliar</Label>
                      <Input
                        id="rep_telefono_aux"
                        value={formData.representante_telefono_auxiliar}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange('representante_telefono_auxiliar', value);
                        }}
                        placeholder="0987654321"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rep_correo">Correo Electrónico</Label>
                      <Input
                        id="rep_correo"
                        type="email"
                        value={formData.representante_correo}
                        onChange={(e) => handleChange('representante_correo', e.target.value)}
                        placeholder="representante@email.com"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}