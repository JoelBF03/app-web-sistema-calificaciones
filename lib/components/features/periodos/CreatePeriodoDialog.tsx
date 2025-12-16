// app/lib/components/admin/CreatePeriodoDialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Calendar, RefreshCw, Plus } from 'lucide-react';
import { periodosService } from '@/lib/services/periodos';
import { CreatePeriodoLectivoData } from '@/lib/types/periodo.types';
import { toast } from 'sonner';

interface CreatePeriodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePeriodoDialog({ isOpen, onClose, onSuccess }: CreatePeriodoDialogProps) {
  const [formData, setFormData] = useState<CreatePeriodoLectivoData>({
    nombre: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setLoading(true);

    try {
      const result = await periodosService.create(formData);
      toast.success(`${result.message} - Se crearon ${result.trimestres.length} trimestres automáticamente`);
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear período lectivo');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      nombre: '',
      fechaInicio: '',
      fechaFin: ''
    });
  };

  const generatePeriodoName = () => {
    const startYear = new Date(formData.fechaInicio).getFullYear();
    const endYear = new Date(formData.fechaFin).getFullYear();
    
    if (startYear && endYear) {
      setFormData({
        ...formData,
        nombre: startYear === endYear ? `Período ${startYear}` : `Período ${startYear}-${endYear}`
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Nuevo Período Lectivo
          </DialogTitle>
          <DialogDescription>
            Se crearán automáticamente 3 trimestres para este período
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
              <Input
                id="fechaInicio"
                type="date"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                onBlur={generatePeriodoName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin *</Label>
              <Input
                id="fechaFin"
                type="date"
                required
                value={formData.fechaFin}
                onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                onBlur={generatePeriodoName}
              />
            </div>
          </div>

          {/* Nombre del período */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Período *</Label>
            <div className="flex gap-2">
              <Input
                id="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Período 2024-2025"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePeriodoName}
                title="Generar nombre automático"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: Se puede generar automáticamente basado en las fechas
            </p>
          </div>

          {/* Vista previa */}
          {formData.nombre && formData.fechaInicio && formData.fechaFin && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📋 Vista Previa:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Nombre:</strong> {formData.nombre}</p>
                <p><strong>Duración:</strong> {new Date(formData.fechaInicio).toLocaleDateString('es-ES')} - {new Date(formData.fechaFin).toLocaleDateString('es-ES')}</p>
                <p><strong>Días totales:</strong> {Math.ceil((new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) / (1000 * 60 * 60 * 24))} días</p>
              </div>
            </div>
          )}

          {/* Información */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">ℹ️ Información importante:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Se crearán automáticamente 3 trimestres</li>
              <li>• Solo puede haber un período activo a la vez</li>
              <li>• Las fechas no pueden solaparse con otros períodos</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Período
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}