'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Calendar, RefreshCw, Info, AlertCircle, LayoutGrid } from 'lucide-react';

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
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-12 gap-8 items-start">
        
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-blue-600" />
              Datos Generales
            </h2>
            <p className="text-sm text-gray-500">Establece el rango de fechas del año académico.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio" className="text-sm font-semibold text-gray-700">Fecha de Inicio</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  onBlur={generatePeriodoName}
                  className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.fechaInicio ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.fechaInicio && <p className="text-[11px] text-red-600 mt-1">{errors.fechaInicio}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin" className="text-sm font-semibold text-gray-700">Fecha de Fin</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  onBlur={generatePeriodoName}
                  className={`pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.fechaFin ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.fechaFin && <p className="text-[11px] text-red-600 mt-1">{errors.fechaFin}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombre del Período</Label>
            <div className="flex gap-2">
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Período 2024-2025"
                className={`h-11 border-gray-200 ${errors.nombre ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={generatePeriodoName}
                disabled={!formData.fechaInicio || !formData.fechaFin}
                className="h-11 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {errors.nombre && <p className="text-[11px] text-red-600 mt-1">{errors.nombre}</p>}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          
          {formData.nombre && formData.fechaInicio && duration && duration > 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" /> Resumen del Período
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                  <span className="text-sm text-slate-600">Nombre:</span>
                  <span className="text-sm font-bold text-slate-900">{formData.nombre}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                  <span className="text-sm text-slate-600">Duración total:</span>
                  <span className="text-sm font-bold text-slate-900">{duration} días</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Equivalencia:</span>
                  <span className="text-sm font-bold text-blue-600">~{Math.round(duration / 30)} meses</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center py-10">
              <Calendar className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-amber-700 font-medium">Ingresa las fechas para ver el cálculo de duración.</p>
            </div>
          )}

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <h4 className="text-[11px] font-bold text-blue-800 uppercase mb-2">Ayuda Técnica</h4>
            <ul className="text-[11px] text-blue-700 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                El sistema dividirá este tiempo en 3 trimestres proporcionales automáticamente.
              </li>
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1 shrink-0" />
                Asegúrate de que las fechas no se crucen con períodos anteriores.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
        <Button variant="ghost" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          Cancelar proceso
        </Button>
        <Button 
          onClick={handleNext} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 shadow-lg shadow-blue-200"
        >
          Configurar Trimestres →
        </Button>
      </div>
    </div>
  );
}