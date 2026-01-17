'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Calendar, RefreshCw, Info, AlertCircle } from 'lucide-react';

interface Step1Data {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

interface Step1PeriodoInfoProps {
  initialData: Step1Data;
  onNext: (data: Step1Data) => void;
  onCancel: () => void;
}

export default function Step1PeriodoInfo({ initialData, onNext, onCancel }: Step1PeriodoInfoProps) {
  const [formData, setFormData] = useState<Step1Data>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof Step1Data, string>>>({});

  const generatePeriodoName = () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      return;
    }

    const startYear = new Date(formData.fechaInicio).getFullYear();
    const endYear = new Date(formData.fechaFin).getFullYear();

    setFormData({
      ...formData,
      nombre: startYear === endYear ? `Período ${startYear}` : `Período ${startYear}-${endYear}`,
    });
  };

  const calculateDuration = () => {
    if (!formData.fechaInicio || !formData.fechaFin) return null;
    
    const days = Math.ceil(
      (new Date(formData.fechaFin).getTime() - new Date(formData.fechaInicio).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    
    return days;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Step1Data, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }

    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const duration = calculateDuration();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Información del Período Lectivo</h2>
        <p className="text-sm text-gray-600">
          Define el nombre y las fechas del período académico
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fechaInicio" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              Fecha de Inicio *
            </Label>
            <Input
              id="fechaInicio"
              type="date"
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              onBlur={generatePeriodoName}
              className={`border-2 ${errors.fechaInicio ? 'border-red-500' : ''}`}
            />
            {errors.fechaInicio && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fechaInicio}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              Fecha de Fin *
            </Label>
            <Input
              id="fechaFin"
              type="date"
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              onBlur={generatePeriodoName}
              className={`border-2 ${errors.fechaFin ? 'border-red-500' : ''}`}
            />
            {errors.fechaFin && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.fechaFin}
              </p>
            )}
          </div>
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Período *</Label>
          <div className="flex gap-2">
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Período 2024-2025"
              className={`flex-1 border-2 ${errors.nombre ? 'border-red-500' : ''}`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={generatePeriodoName}
              disabled={!formData.fechaInicio || !formData.fechaFin}
              title="Generar nombre automático"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {errors.nombre ? (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.nombre}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Se puede generar automáticamente basado en las fechas
            </p>
          )}
        </div>

        {/* Vista previa */}
        {formData.nombre && formData.fechaInicio && formData.fechaFin && duration && duration > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <h4 className="font-medium text-green-800 mb-2">Vista Previa</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Nombre:</strong> {formData.nombre}
                </p>
                <p>
                  <strong>Duración:</strong>{' '}
                  {new Date(formData.fechaInicio).toLocaleDateString('es-ES')} -{' '}
                  {new Date(formData.fechaFin).toLocaleDateString('es-ES')}
                </p>
                <p>
                  <strong>Total:</strong> {duration} días (~{Math.round(duration / 30)} meses)
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Información */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <h4 className="font-medium text-blue-800 mb-2">Información importante</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Se crearán automáticamente 3 trimestres distribuidos equitativamente</li>
              <li>• Solo puede haber un período activo a la vez</li>
              <li>• Las fechas no pueden solaparse con otros períodos existentes</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
          Siguiente: Configurar Trimestres →
        </Button>
      </div>
    </div>
  );
}