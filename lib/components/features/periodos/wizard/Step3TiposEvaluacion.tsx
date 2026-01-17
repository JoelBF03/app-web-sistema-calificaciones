'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Progress } from '@/lib/components/ui/progress';
import { Info, AlertCircle, CheckCircle2, Percent } from 'lucide-react';

interface Step3Data {
  insumos: number;
  proyecto: number;
  examen: number;
}

interface Step3TiposEvaluacionProps {
  initialData: Step3Data;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
}

export default function Step3TiposEvaluacion({
  initialData,
  onNext,
  onBack,
}: Step3TiposEvaluacionProps) {
  const [formData, setFormData] = useState<Step3Data>(initialData);
  const [error, setError] = useState<string>('');

  const total = formData.insumos + formData.proyecto + formData.examen;
  const isValid = Math.abs(total - 100) < 0.01;

  useEffect(() => {
    if (total > 100) {
      setError(`Los porcentajes suman ${total.toFixed(1)}%. Deben sumar exactamente 100%`);
    } else if (total < 100 && total > 0) {
      setError(`Los porcentajes suman ${total.toFixed(1)}%. Faltan ${(100 - total).toFixed(1)}%`);
    } else if (isValid) {
      setError('');
    }
  }, [total, isValid]);

  const handleChange = (field: keyof Step3Data, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setFormData({ ...formData, [field]: numValue });
    }
  };

  const handleNext = () => {
    if (isValid) {
      onNext(formData);
    }
  };

  const tiposEvaluacion = [
    {
      key: 'insumos' as const,
      nombre: 'Insumos',
      descripcion: 'Tareas, deberes, trabajos en clase, participación',
      icon: '📚',
      color: 'border-red-200 bg-red-50',
      barColor: 'bg-red-600',
    },
    {
      key: 'proyecto' as const,
      nombre: 'Proyecto',
      descripcion: 'Proyectos trimestrales, trabajos de investigación',
      icon: '📊',
      color: 'border-yellow-200 bg-yellow-50',
      barColor: 'bg-yellow-500',
    },
    {
      key: 'examen' as const,
      nombre: 'Examen',
      descripcion: 'Exámenes quimestrales, pruebas de fin de trimestre',
      icon: '📝',
      color: 'border-gray-800 bg-gray-50',
      barColor: 'bg-gray-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Porcentajes de Evaluación</h2>
        <p className="text-sm text-gray-600">
          Define cómo se distribuirá la calificación final
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 max-w-3xl mx-auto">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <p className="text-sm text-blue-700">
            Los porcentajes deben sumar exactamente <strong>100%</strong>. Estos porcentajes se aplicarán a todas las materias del período.
          </p>
        </AlertDescription>
      </Alert>

      {/* Tipos de Evaluación Cards */}
      <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
        {tiposEvaluacion.map(({ key, nombre, descripcion, icon, color, barColor }) => (
          <Card key={key} className={`${color} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{icon}</span>
                {nombre}
              </CardTitle>
              <p className="text-xs text-gray-600">{descripcion}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor={key} className="text-xs mb-1 block">
                    Porcentaje
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="border-2 pr-8"
                    />
                    <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="w-32">
                  <Label className="text-xs mb-1 block opacity-0">-</Label>
                  <div className="text-3xl font-bold text-gray-900">{formData[key]}%</div>
                </div>
              </div>
              {/* Custom Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`${barColor} h-full transition-all duration-300`}
                  style={{ width: `${formData[key]}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Progress */}
      <Card className="max-w-3xl mx-auto border-2 border-gray-300">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Total</Label>
              <div className={`text-4xl font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {total.toFixed(1)}%
              </div>
            </div>
            {/* Custom Progress Bar for Total */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`${isValid ? 'bg-green-600' : 'bg-red-600'} h-full transition-all duration-300`}
                style={{ width: `${total > 100 ? 100 : total}%` }}
              />
            </div>
            {isValid ? (
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">Los porcentajes suman 100% correctamente</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Buttons */}
      <div className="flex justify-between pt-4 border-t max-w-3xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          ← Atrás
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
        >
          Siguiente: Revisar y Confirmar →
        </Button>
      </div>
    </div>
  );
}