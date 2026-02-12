'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { 
  CheckCircle2, 
  Percent, 
  Calculator, 
  BookOpen, 
  LayoutDashboard, 
  FileText 
} from 'lucide-react';

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
      setError(`Exceso: ${total.toFixed(0)}% (debe ser 100%)`);
    } else if (total < 100 && total > 0) {
      setError(`Faltan ${(100 - total).toFixed(0)}% para completar`);
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

  const tiposEvaluacion = [
    {
      key: 'insumos' as const,
      nombre: 'INSUMOS',
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/30',
      barColor: 'bg-blue-600',
    },
    {
      key: 'proyecto' as const,
      nombre: 'PROYECTO INTEGRADOR',
      icon: <LayoutDashboard className="h-6 w-6 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/30',
      barColor: 'bg-amber-500',
    },
    {
      key: 'examen' as const,
      nombre: 'EXAMEN',
      icon: <FileText className="h-6 w-6 text-slate-700" />,
      color: 'border-slate-200 bg-slate-50/30',
      barColor: 'bg-slate-800',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Porcentajes de Evaluación</h2>
          <p className="text-xs text-gray-500">Define el peso de cada componente</p>
        </div>
        
        <div className="flex flex-col items-end gap-1">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Total Acumulado:</span>
              <span className={`text-2xl font-black ${isValid ? 'text-emerald-600' : 'text-red-500'}`}>
                {total}%
              </span>
           </div>
           <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden border">
              <div 
                className={`h-full transition-all duration-500 ${isValid ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(total, 100)}%` }}
              />
           </div>
        </div>
      </div>

      <div className={`p-2.5 rounded-lg border flex items-center gap-3 transition-colors ${
        isValid ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
      }`}>
        {isValid ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <Calculator className="h-5 w-5 text-amber-600" />
        )}
        <p className={`text-xs font-bold ${isValid ? 'text-emerald-800' : 'text-amber-800'}`}>
          {isValid 
            ? 'CONFIGURACIÓN VÁLIDA: Los pesos suman el 100% requerido.' 
            : error || 'Ajusta los valores para completar el 100%'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tiposEvaluacion.map(({ key, nombre, icon, color, barColor }) => (
          <Card key={key} className={`${color} border shadow-none relative overflow-hidden`}>
            <CardHeader className="p-4 pb-2 space-y-0 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 bg-white rounded-full shadow-sm border">
                  {icon}
                </div>
                <CardTitle className="text-xs font-black text-gray-800 tracking-tight leading-tight uppercase">
                  {nombre}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="flex justify-center">
                <div className="bg-white/90 border-2 border-white px-4 py-2 rounded-2xl shadow-sm text-center min-w-[80px]">
                  <span className="text-2xl font-black text-gray-900">{formData[key]}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={key} className="text-[10px] uppercase font-black text-gray-500 text-center block">
                  ASIGNAR PESO
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type="number"
                    value={formData[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="h-10 text-center text-base font-black bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-lg"
                  />
                  <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div className="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                <div 
                  className={`${barColor} h-full transition-all duration-300`}
                  style={{ width: `${formData[key]}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t items-center">
        <Button variant="ghost" onClick={onBack} className="text-gray-500 font-bold">
          ← ATRÁS
        </Button>
        <Button 
          onClick={() => { if (isValid) onNext(formData); }} 
          disabled={!isValid}
          className={`px-10 h-11 font-black rounded-xl shadow-lg transition-all active:scale-95 ${
            isValid 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed border-none'
          }`}
        >
          SIGUIENTE: FINALIZAR →
        </Button>
      </div>
    </div>
  );
}