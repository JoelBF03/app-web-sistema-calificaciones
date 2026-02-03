'use client';

import { Button } from '@/lib/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Badge } from '@/lib/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Loader2,
  BookOpen,
  LayoutDashboard,
  FileText,
  Clock,
  ArrowRight,
  Target
} from 'lucide-react';

interface Step4PreviewProps {
  periodoData: { nombre: string; fechaInicio: string; fechaFin: string; };
  trimestresData: { 
    trimestre1: { fechaInicio: string; fechaFin: string; };
    trimestre2: { fechaInicio: string; fechaFin: string; };
    trimestre3: { fechaInicio: string; fechaFin: string; };
    modificados: boolean;
  };
  tiposEvaluacionData: { insumos: number; proyecto: number; examen: number; };
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
    const days = Math.ceil((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} días`;
  };

  return (
    <div className="space-y-6">
      {/* Título de Sección */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-gray-900 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-blue-600" />
          REVISAR CONFIGURACIÓN
        </h2>
        <p className="text-sm text-gray-500 font-medium">Confirma los detalles de los tres pasos anteriores</p>
      </div>

      {/* Grid de 3 Columnas - Los 3 Pasos */}
      <div className="grid grid-cols-3 gap-4">
        
        {/* PASO 1: PERIODO */}
        <Card className="border-2 border-blue-100 shadow-sm">
          <CardHeader className="p-4 border-b bg-blue-50/50">
            <CardTitle className="text-xs font-black text-blue-700 uppercase flex items-center gap-2">
              <Calendar className="h-4 w-4" /> 1. Periodo Lectivo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nombre</span>
              <p className="text-sm font-black text-gray-800 uppercase">{periodoData.nombre}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duración Total</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 font-bold">{getDuration(periodoData.fechaInicio, periodoData.fechaFin)}</Badge>
              </div>
            </div>
            <div className="pt-2 border-t border-dashed">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500 font-medium">Desde:</span>
                <span>{formatDate(periodoData.fechaInicio)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold mt-1">
                <span className="text-gray-500 font-medium">Hasta:</span>
                <span>{formatDate(periodoData.fechaFin)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PASO 2: TRIMESTRES */}
        <Card className="border-2 border-amber-100 shadow-sm">
          <CardHeader className="p-4 border-b bg-amber-50/50">
            <CardTitle className="text-xs font-black text-amber-700 uppercase flex items-center gap-2">
              <Clock className="h-4 w-4" /> 2. Trimestres
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {[
              { n: '1ro', d: trimestresData.trimestre1, color: 'bg-blue-100 text-blue-700' },
              { n: '2do', d: trimestresData.trimestre2, color: 'bg-amber-100 text-amber-700' },
              { n: '3ro', d: trimestresData.trimestre3, color: 'bg-slate-100 text-slate-700' }
            ].map((t) => (
              <div key={t.n} className="p-2 rounded-lg border bg-white flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-black px-1.5 rounded ${t.color}`}>{t.n} TRIMESTRE</span>
                  <span className="text-[10px] font-bold text-gray-400">{getDuration(t.d.fechaInicio, t.d.fechaFin)}</span>
                </div>
                <div className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                  {formatDate(t.d.fechaInicio)} <ArrowRight className="h-2 w-2 text-gray-300" /> {formatDate(t.d.fechaFin)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PASO 3: EVALUACIÓN */}
        <Card className="border-2 border-emerald-100 shadow-sm">
          <CardHeader className="p-4 border-b bg-emerald-50/50">
            <CardTitle className="text-xs font-black text-emerald-700 uppercase flex items-center gap-2">
              <Target className="h-4 w-4" /> 3. Evaluación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              {[
                { l: 'Insumos', v: tiposEvaluacionData.insumos, i: BookOpen, c: 'text-blue-500' },
                { l: 'Proyecto', v: tiposEvaluacionData.proyecto, i: LayoutDashboard, c: 'text-amber-500' },
                { l: 'Examen', v: tiposEvaluacionData.examen, i: FileText, c: 'text-emerald-500' }
              ].map((item) => (
                <div key={item.l} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.i className={`h-3.5 w-3.5 ${item.c}`} />
                    <span className="text-xs font-bold text-gray-600">{item.l}</span>
                  </div>
                  <span className="text-sm font-black">{item.v}%</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-dashed flex justify-between items-center text-emerald-700">
              <span className="text-[10px] font-black uppercase">Peso Total</span>
              <span className="text-lg font-black tracking-tighter">100%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta Única y Compacta */}
      <div className="bg-slate-900 rounded-xl p-3 flex items-center gap-4 text-white">
        <div className="bg-amber-500 p-2 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-slate-900" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold leading-none mb-1 text-amber-500 uppercase tracking-wider">Aviso de seguridad</p>
          <p className="text-[10px] text-slate-400 font-medium">
            Esta acción creará los registros definitivos. Verifica que las fechas no se solapen con periodos existentes.
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-between items-center pt-2">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          disabled={isCreating} 
          className="font-black text-gray-400 uppercase text-xs hover:bg-transparent hover:text-gray-600"
        >
          ← Corregir pasos
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 rounded-xl h-12 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              CREANDO...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              CONFIRMAR Y FINALIZAR
            </>
          )}
        </Button>
      </div>
    </div>
  );
}