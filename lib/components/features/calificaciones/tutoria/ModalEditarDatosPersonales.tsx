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

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🆕 Validación para nombres (solo letras, espacios, tildes, ñ)
  const validarNombre = (value: string) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
  };

  // 🆕 Validación para cédula (solo números, 10 dígitos)
  const validarCedula = (value: string) => {
    return /^[A-Za-z0-9]{1,13}$/.test(value);
  };

  // 🆕 Validación para teléfono (solo números, 10 dígitos)
  const validarTelefono = (value: string) => {
    return /^\d{0,10}$/.test(value);
  };

  // 🆕 Validación para email
  const validarEmail = (value: string) => {
    if (!value) return true; // Opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // 🆕 Validación para fecha de nacimiento (no puede ser futura)
  const validarFechaNacimiento = (value: string) => {
    if (!value) return true; // Opcional
    const fecha = new Date(value);
    const hoy = new Date();
    return fecha <= hoy;
  };

  const handleChange = (field: string, value: any) => {
    let newErrors = { ...errors };

    // Validaciones específicas por campo
    if (field === 'padre_nombre' || field === 'padre_apellido' || 
        field === 'madre_nombre' || field === 'madre_apellido' || 
        field === 'representante_nombre' || field === 'representante_apellido' ||
        field === 'representante_parentesco') {
      
      if (!validarNombre(value)) {
        newErrors[field] = 'Solo se permiten letras y espacios';
        setErrors(newErrors);
        return; // No actualizar el campo
      } else {
        delete newErrors[field];
      }
    }

    if (field === 'padre_cedula' || field === 'madre_cedula') {
      if (!validarCedula(value)) {
        newErrors[field] = 'Solo se permiten números (máx. 10 dígitos)';
        setErrors(newErrors);
        return;
      } else {
        delete newErrors[field];
      }
    }

    if (field === 'representante_telefono' || field === 'representante_telefono_auxiliar') {
      if (!validarTelefono(value)) {
        newErrors[field] = 'Solo se permiten números (máx. 10 dígitos)';
        setErrors(newErrors);
        return;
      } else {
        delete newErrors[field];
      }
    }

    if (field === 'representante_correo') {
      if (value && !validarEmail(value)) {
        newErrors[field] = 'Email inválido';
      } else {
        delete newErrors[field];
      }
    }

    if (field === 'fecha_de_nacimiento') {
      if (value && !validarFechaNacimiento(value)) {
        newErrors[field] = 'La fecha no puede ser futura';
      } else {
        delete newErrors[field];
      }
    }

    setErrors(newErrors);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarFormulario = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar email si está presente
    if (formData.representante_correo && !validarEmail(formData.representante_correo)) {
      newErrors.representante_correo = 'Email inválido';
    }

    // Validar fecha de nacimiento si está presente
    if (formData.fecha_de_nacimiento && !validarFechaNacimiento(formData.fecha_de_nacimiento)) {
      newErrors.fecha_de_nacimiento = 'La fecha no puede ser futura';
    }

    // Validar longitud de cédulas
    if (formData.padre_cedula && formData.padre_cedula.length !== 13) {
      newErrors.padre_cedula = 'La cédula debe tener 13 dígitos';
    }
    if (formData.madre_cedula && formData.madre_cedula.length !== 13) {
      newErrors.madre_cedula = 'La cédula debe tener 13 dígitos';
    }

    // Validar longitud de teléfonos
    if (formData.representante_telefono && formData.representante_telefono.length !== 10) {
      newErrors.representante_telefono = 'El teléfono debe tener 10 dígitos';
    }
    if (formData.representante_telefono_auxiliar && formData.representante_telefono_auxiliar.length !== 10) {
      newErrors.representante_telefono_auxiliar = 'El teléfono debe tener 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
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

            <TabsContent value="datos-personales" className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="space-y-2">
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={formData.fecha_de_nacimiento}
                    onChange={(e) => handleChange('fecha_de_nacimiento', e.target.value)}
                    className={errors.fecha_de_nacimiento ? 'border-red-500' : ''}
                  />
                  {errors.fecha_de_nacimiento && (
                    <p className="text-xs text-red-600">{errors.fecha_de_nacimiento}</p>
                  )}
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

            {/* Información Padres */}
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
                      placeholder="Juan Carlos"
                      className={errors.padre_nombre ? 'border-red-500' : ''}
                    />
                    {errors.padre_nombre && (
                      <p className="text-xs text-red-600">{errors.padre_nombre}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={formData.padre_apellido}
                      onChange={(e) => handleChange('padre_apellido', e.target.value)}
                      placeholder="García Pérez"
                      className={errors.padre_apellido ? 'border-red-500' : ''}
                    />
                    {errors.padre_apellido && (
                      <p className="text-xs text-red-600">{errors.padre_apellido}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula/Pasaporte </Label>
                    <Input
                      value={formData.padre_cedula}
                      onChange={(e) => handleChange('padre_cedula', e.target.value)}
                      placeholder="1234567890"
                      maxLength={13}
                      className={errors.padre_cedula ? 'border-red-500' : ''}
                    />
                    {errors.padre_cedula && (
                      <p className="text-xs text-red-600">{errors.padre_cedula}</p>
                    )}
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
                      placeholder="María José"
                      className={errors.madre_nombre ? 'border-red-500' : ''}
                    />
                    {errors.madre_nombre && (
                      <p className="text-xs text-red-600">{errors.madre_nombre}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={formData.madre_apellido}
                      onChange={(e) => handleChange('madre_apellido', e.target.value)}
                      placeholder="Macías López"
                      className={errors.madre_apellido ? 'border-red-500' : ''}
                    />
                    {errors.madre_apellido && (
                      <p className="text-xs text-red-600">{errors.madre_apellido}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Cédula/Pasaporte </Label>
                    <Input
                      value={formData.madre_cedula}
                      onChange={(e) => handleChange('madre_cedula', e.target.value)}
                      placeholder="1234567890"
                      maxLength={13}
                      className={errors.madre_cedula ? 'border-red-500' : ''}
                    />
                    {errors.madre_cedula && (
                      <p className="text-xs text-red-600">{errors.madre_cedula}</p>
                    )}
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

            {/* Representante */}
            <TabsContent value="representante" className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={formData.representante_nombre}
                    onChange={(e) => handleChange('representante_nombre', e.target.value)}
                    placeholder="María José"
                    className={errors.representante_nombre ? 'border-red-500' : ''}
                  />
                  {errors.representante_nombre && (
                    <p className="text-xs text-red-600">{errors.representante_nombre}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Apellido</Label>
                  <Input
                    value={formData.representante_apellido}
                    onChange={(e) => handleChange('representante_apellido', e.target.value)}
                    placeholder="Macías López"
                    className={errors.representante_apellido ? 'border-red-500' : ''}
                  />
                  {errors.representante_apellido && (
                    <p className="text-xs text-red-600">{errors.representante_apellido}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teléfono Principal (10 dígitos)</Label>
                  <Input
                    value={formData.representante_telefono}
                    onChange={(e) => handleChange('representante_telefono', e.target.value)}
                    placeholder="0987654321"
                    maxLength={10}
                    className={errors.representante_telefono ? 'border-red-500' : ''}
                  />
                  {errors.representante_telefono && (
                    <p className="text-xs text-red-600">{errors.representante_telefono}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teléfono Auxiliar (10 dígitos)</Label>
                  <Input
                    value={formData.representante_telefono_auxiliar}
                    onChange={(e) => handleChange('representante_telefono_auxiliar', e.target.value)}
                    placeholder="0987654321"
                    maxLength={10}
                    className={errors.representante_telefono_auxiliar ? 'border-red-500' : ''}
                  />
                  {errors.representante_telefono_auxiliar && (
                    <p className="text-xs text-red-600">{errors.representante_telefono_auxiliar}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Correo</Label>
                  <Input
                    type="email"
                    value={formData.representante_correo}
                    onChange={(e) => handleChange('representante_correo', e.target.value)}
                    placeholder="representante@gmail.com"
                    className={errors.representante_correo ? 'border-red-500' : ''}
                  />
                  {errors.representante_correo && (
                    <p className="text-xs text-red-600">{errors.representante_correo}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Parentesco</Label>
                  <Input
                    value={formData.representante_parentesco}
                    onChange={(e) => handleChange('representante_parentesco', e.target.value)}
                    placeholder="Ej: Padre, Madre, Tío, Abuelo"
                    className={errors.representante_parentesco ? 'border-red-500' : ''}
                  />
                  {errors.representante_parentesco && (
                    <p className="text-xs text-red-600">{errors.representante_parentesco}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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