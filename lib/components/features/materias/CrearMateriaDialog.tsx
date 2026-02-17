'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import { useMaterias } from '@/lib/hooks/useMaterias';
import {
  Materia,
  CreateMateriaDto,
  NivelEducativo,
  TipoCalificacion,
  NivelEducativoLabels,
  TipoCalificacionLabels,
} from '@/lib/types/materia.types';
import { materiaService, VerificacionEdicion } from '@/lib/services/materias';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';

interface CrearEditarMateriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materia?: Materia | null;
  onSuccess: () => void;
}

export default function CrearEditarMateriaDialog({
  open,
  onOpenChange,
  materia,
  onSuccess,
}: CrearEditarMateriaDialogProps) {
  const { crearMateria, actualizarMateria, loading } = useMaterias();
  const [formData, setFormData] = useState<CreateMateriaDto>({
    nombre: '',
    nivelEducativo: NivelEducativo.BASICA,
    tipoCalificacion: TipoCalificacion.CUANTITATIVA,
  });
  const [verificacion, setVerificacion] = useState<VerificacionEdicion | null>(null);
  const [verificando, setVerificando] = useState(false);

  const esEdicion = !!materia;

  useEffect(() => {
    if (materia) {
      setFormData({
        nombre: materia.nombre,
        nivelEducativo: materia.nivelEducativo,
        tipoCalificacion: materia.tipoCalificacion,
      });
    } else {
      setFormData({
        nombre: '',
        nivelEducativo: NivelEducativo.BASICA,
        tipoCalificacion: TipoCalificacion.CUANTITATIVA,
      });
    }
    setVerificacion(null);
  }, [materia, open]);

  // 🆕 Verificar implicaciones cuando cambia un campo importante en edición
  useEffect(() => {
    if (!esEdicion || !materia) return;

    const hayCambioImportante =
      formData.tipoCalificacion !== materia.tipoCalificacion ||
      formData.nivelEducativo !== materia.nivelEducativo ||
      (formData.nombre && formData.nombre !== materia.nombre);

    if (!hayCambioImportante) {
      setVerificacion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setVerificando(true);
      try {
        const result = await materiaService.verificarEdicion(materia.id, formData);
        setVerificacion(result);
      } catch {
        // Silenciar errores de verificación
      } finally {
        setVerificando(false);
      }
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [formData, materia, esEdicion]);

  const tieneBloqueos = verificacion && verificacion.bloqueos.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tieneBloqueos) {
      toast.error('Hay bloqueos que impiden guardar los cambios');
      return;
    }

    try {
      if (esEdicion && materia) {
        await actualizarMateria(materia.id, formData);
        toast.success('Materia actualizada exitosamente');
      } else {
        await crearMateria(formData);
        toast.success('Materia creada exitosamente');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al procesar la solicitud'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-semibold">
              {esEdicion ? 'Editar Materia' : 'Crear Nueva Materia'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {esEdicion
                ? 'Actualiza la información de la materia seleccionada.'
                : 'Registra una nueva materia en el sistema.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre de la materia <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                placeholder="Ej: Matemáticas"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
                minLength={3}
                maxLength={50}
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Nivel educativo <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.nivelEducativo}
                  onValueChange={(value: NivelEducativo) =>
                    setFormData({
                      ...formData,
                      nivelEducativo: value,
                    })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NivelEducativoLabels).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de calificación</Label>
                <Select
                  value={formData.tipoCalificacion}
                  onValueChange={(value: TipoCalificacion) =>
                    setFormData({
                      ...formData,
                      tipoCalificacion: value,
                    })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TipoCalificacionLabels).map(
                      ([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🆕 Advertencias y bloqueos */}
            {verificando && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verificando implicaciones...
              </div>
            )}

            {verificacion && verificacion.bloqueos.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <ShieldAlert className="w-5 h-5" />
                  Cambio no permitido
                </div>
                {verificacion.bloqueos.map((bloqueo, i) => (
                  <p key={i} className="text-sm text-red-600">{bloqueo}</p>
                ))}
              </div>
            )}

            {verificacion && verificacion.advertencias.length > 0 && verificacion.bloqueos.length === 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-medium">
                  <AlertTriangle className="w-5 h-5" />
                  Advertencia
                </div>
                {verificacion.advertencias.map((adv, i) => (
                  <p key={i} className="text-sm text-amber-600">{adv}</p>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !!tieneBloqueos}>
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {esEdicion ? 'Guardar cambios' : 'Crear materia'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}