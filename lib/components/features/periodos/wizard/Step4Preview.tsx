'use client';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Separator } from '@/lib/components/ui/separator';
import { Badge } from '@/lib/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { NombreTrimestre } from '@/lib/types/periodo.types';

interface PeriodoData {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
}

interface TrimestreData {
  fechaInicio: string;
  fechaFin: string;
}

interface TrimestresData {
  trimestre1: TrimestreData;
  trimestre2: TrimestreData;
  trimestre3: TrimestreData;
  modificados: boolean;
}

interface TiposEvaluacionData {
  insumos: number;
  proyecto: number;
  examen: number;
}

interface Step4PreviewProps {
  periodoData: PeriodoData;
  trimestresData: TrimestresData;
  tiposEvaluacionData: TiposEvaluacionData;
  onBack: () => void;
  onConfirm: () => void;
  isCreating: boolean;
}

export default function Step4Preview({
  periodoData,
  trimestresData,
  tiposEvaluacionData,
  onBack,
  onConfirm,
  isCreating,
}: Step4PreviewProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDuration = (inicio: string, fin: string) => {
    const days = Math.ceil(
      (new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} días`;
  };

  const trimestres = [
    { 
      nombre: NombreTrimestre.PRIMER_TRIMESTRE, 
      icon: '1️⃣', 
      data: trimestresData.trimestre1,
      color: 'bg-red-50 border-red-200'
    },
    { 
      nombre: NombreTrimestre.SEGUNDO_TRIMESTRE, 
      icon: '2️⃣', 
      data: trimestresData.trimestre2,
      color: 'bg-yellow-50 border-yellow-200'
    },
    { 
      nombre: NombreTrimestre.TERCER_TRIMESTRE, 
      icon: '3️⃣', 
      data: trimestresData.trimestre3,
      color: 'bg-gray-50 border-gray-300'
    },
  ];

  const tiposEvaluacion = [
    { nombre: 'Insumos', porcentaje: tiposEvaluacionData.insumos, icon: '📚', color: 'bg-red-600' },
    { nombre: 'Proyecto', porcentaje: tiposEvaluacionData.proyecto, icon: '📊', color: 'bg-yellow-500' },
    { nombre: 'Examen', porcentaje: tiposEvaluacionData.examen, icon: '📝', color: 'bg-gray-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-yellow-500 mb-2">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Revisar y Confirmar</h2>
        <p className="text-sm text-gray-600">
          Verifica que toda la información sea correcta antes de crear el período
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Período Lectivo */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              Período Lectivo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nombre:</span>
              <span className="font-semibold text-lg">{periodoData.nombre}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fecha de Inicio:</span>
              <Badge variant="outline" className="text-sm">
                {formatDate(periodoData.fechaInicio)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Fecha de Fin:</span>
              <Badge variant="outline" className="text-sm">
                {formatDate(periodoData.fechaFin)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Duración Total:</span>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {getDuration(periodoData.fechaInicio, periodoData.fechaFin)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Trimestres */}
        <Card className="border-2 border-gray-300">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-gray-700" />
              Trimestres
              {trimestresData.modificados && (
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                  Personalizados
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Distribución del período académico en 3 trimestres
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {trimestres.map(({ nombre, icon, data, color }) => (
              <div key={nombre} className={`p-3 rounded-lg border-2 ${color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    {nombre}
                  </span>
                  <span className="text-xs text-gray-600">
                    {getDuration(data.fechaInicio, data.fechaFin)}
                  </span>
                </div>
                <div className="text-xs text-gray-700 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDate(data.fechaInicio)} - {formatDate(data.fechaFin)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tipos de Evaluación */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
              Porcentajes de Evaluación
            </CardTitle>
            <CardDescription>
              Distribución de la calificación final
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {tiposEvaluacion.map(({ nombre, porcentaje, icon, color }) => (
              <div key={nombre} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium">{nombre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${color} h-full`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg w-16 text-right">{porcentaje}%</span>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-xl text-green-600">100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Warning Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <p className="font-medium text-orange-800 mb-1">⚠️ Acción irreversible</p>
            <p className="text-sm text-orange-700">
              Al confirmar se creará el período lectivo con los 3 trimestres y los tipos de evaluación en la base de datos.
              Esta acción no se puede deshacer automáticamente.
            </p>
          </AlertDescription>
        </Alert>

        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El primer trimestre se activará automáticamente</li>
              <li>• El período quedará en estado ACTIVO</li>
              <li>• Los porcentajes se aplicarán a todas las materias</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4 border-t max-w-3xl mx-auto">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          ← Atrás
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isCreating}
          className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-semibold px-8"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando Período...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Crear Período Lectivo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}