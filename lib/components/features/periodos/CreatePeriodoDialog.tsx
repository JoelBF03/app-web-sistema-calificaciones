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
import { Calendar, RefreshCw, Plus, AlertCircle, Info } from 'lucide-react';
import { periodosService } from '@/lib/services/periodos';
import { CreatePeriodoLectivoData } from '@/lib/types/periodo.types';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

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

  const calculateDuration = () => {
    if (!formData.fechaInicio || !formData.fechaFin) return null;
    const days = Math.ceil(
      (new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const duration = calculateDuration();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-green-600" />
            Nuevo Período Lectivo
          </DialogTitle>
          <DialogDescription>
            Se crearán automáticamente 3 trimestres y porcentajes de evaluación por defecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de Inicio *
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                onBlur={generatePeriodoName}
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de Fin *
              </Label>
              <Input
                id="fechaFin"
                type="date"
                required
                value={formData.fechaFin}
                onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                onBlur={generatePeriodoName}
                className="border-2"
              />
            </div>
          </div>

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
                className="flex-1 border-2"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePeriodoName}
                title="Generar nombre automático"
                disabled={!formData.fechaInicio || !formData.fechaFin}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Se puede generar automáticamente basado en las fechas
            </p>
          </div>

          {formData.nombre && formData.fechaInicio && formData.fechaFin && duration && duration > 0 && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <h4 className="font-medium text-green-800 mb-2">Vista Previa</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Nombre:</strong> {formData.nombre}</p>
                  <p><strong>Duración:</strong> {new Date(formData.fechaInicio).toLocaleDateString('es-ES')} - {new Date(formData.fechaFin).toLocaleDateString('es-ES')}</p>
                  <p><strong>Total:</strong> {duration} días (~{Math.round(duration / 30)} meses)</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <h4 className="font-medium text-blue-800 mb-2">Información importante</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Se crearán automáticamente 3 trimestres</li>
                <li>• Porcentajes por defecto: Insumos 40%, Proyecto 20%, Examen 40%</li>
                <li>• Solo puede haber un período activo a la vez</li>
                <li>• Las fechas no pueden solaparse con otros períodos</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.nombre || !formData.fechaInicio || !formData.fechaFin} 
              className="bg-green-600 hover:bg-green-700"
            >
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