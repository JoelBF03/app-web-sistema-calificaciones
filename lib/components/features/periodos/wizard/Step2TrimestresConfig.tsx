'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Button } from '@/lib/components/ui/button';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Calendar, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // Calcular trimestres automáticamente si no están modificados
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

    // Validar cada trimestre
    const trimestres = [
      { nombre: 'Primer Trimestre', data: formData.trimestre1 },
      { nombre: 'Segundo Trimestre', data: formData.trimestre2 },
      { nombre: 'Tercer Trimestre', data: formData.trimestre3 },
    ];

    trimestres.forEach((trimestre) => {
      const inicio = new Date(trimestre.data.fechaInicio);
      const fin = new Date(trimestre.data.fechaFin);

      if (fin <= inicio) {
        newErrors.push(`${trimestre.nombre}: La fecha de fin debe ser posterior a la fecha de inicio`);
      }

      if (inicio < periodoInicio) {
        newErrors.push(`${trimestre.nombre}: La fecha de inicio no puede ser anterior al inicio del período`);
      }

      if (fin > periodoFin) {
        newErrors.push(`${trimestre.nombre}: La fecha de fin no puede ser posterior al fin del período`);
      }
    });

    // Validar que no se solapen
    const t1Fin = new Date(formData.trimestre1.fechaFin);
    const t2Inicio = new Date(formData.trimestre2.fechaInicio);
    const t2Fin = new Date(formData.trimestre2.fechaFin);
    const t3Inicio = new Date(formData.trimestre3.fechaInicio);

    if (t2Inicio < t1Fin) {
      newErrors.push('El Segundo Trimestre debe iniciar después de que finalice el Primer Trimestre');
    }

    if (t3Inicio < t2Fin) {
      newErrors.push('El Tercer Trimestre debe iniciar después de que finalice el Segundo Trimestre');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  const getDuration = (inicio: string, fin: string) => {
    const days = Math.ceil(
      (new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} días`;
  };

  const trimestreCards = [
    { key: 'trimestre1' as const, nombre: NombreTrimestre.PRIMER_TRIMESTRE, icon: '1️⃣', color: 'border-red-200 bg-red-50' },
    { key: 'trimestre2' as const, nombre: NombreTrimestre.SEGUNDO_TRIMESTRE, icon: '2️⃣', color: 'border-yellow-200 bg-yellow-50' },
    { key: 'trimestre3' as const, nombre: NombreTrimestre.TERCER_TRIMESTRE, icon: '3️⃣', color: 'border-gray-800 bg-gray-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Configuración de Trimestres</h2>
        <p className="text-sm text-gray-600">
          Ajusta las fechas de cada trimestre (opcional)
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 max-w-3xl mx-auto">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <p className="text-sm text-blue-700">
            Los trimestres se han distribuido automáticamente de forma equitativa. Puedes ajustar las fechas si es necesario.
          </p>
        </AlertDescription>
      </Alert>

      {/* Trimestres Cards */}
      <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
        {trimestreCards.map(({ key, nombre, icon, color }) => (
          <Card key={key} className={`${color} border-2`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{icon}</span>
                {nombre}
                <span className="ml-auto text-sm font-normal text-gray-600">
                  {getDuration(formData[key].fechaInicio, formData[key].fechaFin)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${key}-inicio`} className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3 w-3" />
                    Fecha de Inicio
                  </Label>
                  <Input
                    id={`${key}-inicio`}
                    type="date"
                    value={formData[key].fechaInicio}
                    onChange={(e) => handleTrimestreChange(key, 'fechaInicio', e.target.value)}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${key}-fin`} className="flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3 w-3" />
                    Fecha de Fin
                  </Label>
                  <Input
                    id={`${key}-fin`}
                    type="date"
                    value={formData[key].fechaFin}
                    onChange={(e) => handleTrimestreChange(key, 'fechaFin', e.target.value)}
                    className="border-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <p className="font-medium text-red-800 mb-2">Se encontraron los siguientes errores:</p>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {errors.length === 0 && formData.modificados && (
        <Alert className="border-green-200 bg-green-50 max-w-3xl mx-auto">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <p className="text-sm text-green-700 font-medium">
              ✅ Las fechas de los trimestres son válidas
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Buttons */}
      <div className="flex justify-between pt-4 border-t max-w-3xl mx-auto">
        <Button variant="outline" onClick={onBack}>
          ← Atrás
        </Button>
        <Button onClick={handleNext} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
          Siguiente: Porcentajes de Evaluación →
        </Button>
      </div>
    </div>
  );
}