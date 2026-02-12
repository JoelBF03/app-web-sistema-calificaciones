'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Calendar, Info, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { NombreTrimestre } from '@/lib/types/periodo.types';

interface TrimestreData {
  fechaInicio: string;
  fechaFin: string;
}

interface Step2Data {
  trimestre1: TrimestreData;
  trimestre2: TrimestreData;
  trimestre3: TrimestreData;
  modificados: boolean;
}

interface Step2TrimestresConfigProps {
  periodoFechaInicio: string;
  periodoFechaFin: string;
  initialData: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export default function Step2TrimestresConfig({
  periodoFechaInicio,
  periodoFechaFin,
  initialData,
  onNext,
  onBack,
}: Step2TrimestresConfigProps) {
  const [formData, setFormData] = useState<Step2Data>(initialData);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!formData.modificados) {
      const fechaInicio = new Date(periodoFechaInicio);
      const fechaFin = new Date(periodoFechaFin);
      const duracionTotal = fechaFin.getTime() - fechaInicio.getTime();
      const duracionTrimestre = duracionTotal / 3;

      setFormData({
        trimestre1: {
          fechaInicio: fechaInicio.toISOString().split('T')[0],
          fechaFin: new Date(fechaInicio.getTime() + duracionTrimestre).toISOString().split('T')[0],
        },
        trimestre2: {
          fechaInicio: new Date(fechaInicio.getTime() + duracionTrimestre).toISOString().split('T')[0],
          fechaFin: new Date(fechaInicio.getTime() + duracionTrimestre * 2).toISOString().split('T')[0],
        },
        trimestre3: {
          fechaInicio: new Date(fechaInicio.getTime() + duracionTrimestre * 2).toISOString().split('T')[0],
          fechaFin: fechaFin.toISOString().split('T')[0],
        },
        modificados: false,
      });
    }
  }, [periodoFechaInicio, periodoFechaFin, formData.modificados]);

  const handleTrimestreChange = (trimestre: 'trimestre1' | 'trimestre2' | 'trimestre3', field: 'fechaInicio' | 'fechaFin', value: string) => {
    setFormData({
      ...formData,
      [trimestre]: {
        ...formData[trimestre],
        [field]: value,
      },
      modificados: true,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    const periodoInicio = new Date(periodoFechaInicio);
    const periodoFin = new Date(periodoFechaFin);

    const trimestres = [
      { nombre: '1er Trimestre', data: formData.trimestre1 },
      { nombre: '2do Trimestre', data: formData.trimestre2 },
      { nombre: '3er Trimestre', data: formData.trimestre3 },
    ];

    trimestres.forEach((trimestre) => {
      const inicio = new Date(trimestre.data.fechaInicio);
      const fin = new Date(trimestre.data.fechaFin);

      if (fin <= inicio) {
        newErrors.push(`${trimestre.nombre}: Fin debe ser posterior al inicio`);
      }
      if (inicio < periodoInicio || fin > periodoFin) {
        newErrors.push(`${trimestre.nombre}: Fuera del rango del periodo`);
      }
    });

    if (new Date(formData.trimestre2.fechaInicio) < new Date(formData.trimestre1.fechaFin)) {
      newErrors.push('T2 no puede iniciar antes que termine T1');
    }
    if (new Date(formData.trimestre3.fechaInicio) < new Date(formData.trimestre2.fechaFin)) {
      newErrors.push('T3 no puede iniciar antes que termine T2');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const getDuration = (inicio: string, fin: string) => {
    const days = Math.ceil(
      (new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} días`;
  };

  const trimestreCards = [
    { key: 'trimestre1' as const, nombre: '1er Trimestre', color: 'border-blue-200 bg-blue-50/30', text: 'text-blue-700' },
    { key: 'trimestre2' as const, nombre: '2do Trimestre', color: 'border-indigo-200 bg-indigo-50/30', text: 'text-indigo-700' },
    { key: 'trimestre3' as const, nombre: '3er Trimestre', color: 'border-purple-200 bg-purple-50/30', text: 'text-purple-700' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configuración de Tiempos</h2>
          <p className="text-xs text-gray-500">Distribución de trimestres</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-gray-400 uppercase">Periodo Total</p>
          <p className="text-xs font-bold text-blue-600">{periodoFechaInicio} al {periodoFechaFin}</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <p className="text-[11px] text-blue-700">
          Fechas calculadas <strong>equitativamente</strong>. Ajusta con cuidado de no solapar periodos.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {trimestreCards.map(({ key, nombre, color, text }) => (
          <Card key={key} className={`${color} border shadow-none`}>
            <CardHeader className="py-2 px-3 border-b border-white/50 space-y-0">
              <div className="flex justify-between items-center">
                <CardTitle className={`text-[11px] font-bold uppercase ${text}`}>{nombre}</CardTitle>
                <span className="text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded text-gray-600">
                  {getDuration(formData[key].fechaInicio, formData[key].fechaFin)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-gray-500">Inicia</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="date"
                    value={formData[key].fechaInicio}
                    onChange={(e) => handleTrimestreChange(key, 'fechaInicio', e.target.value)}
                    className="pl-7 h-8 text-xs bg-white border-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-center -my-1">
                <ArrowRight className="h-3 w-3 text-gray-300" />
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] text-gray-500">Finaliza</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    type="date"
                    value={formData[key].fechaFin}
                    onChange={(e) => handleTrimestreChange(key, 'fechaFin', e.target.value)}
                    className="pl-7 h-8 text-xs bg-white border-gray-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="h-10">
        {errors.length > 0 ? (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-[10px] font-medium truncate">
              {errors[0]} {errors.length > 1 && `(+${errors.length - 1} más)`}
            </p>
          </div>
        ) : formData.modificados && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            <p className="text-[10px] font-medium">Cronograma válido y consistente.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-3 border-t">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="h-9 text-xs border-gray-300 text-gray-600"
        >
          ← Atrás
        </Button>
        <Button 
          onClick={() => { if (validateForm()) onNext(formData); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 text-xs font-bold shadow-sm"
        >
          Siguiente: Evaluación →
        </Button>
      </div>
    </div>
  );
}