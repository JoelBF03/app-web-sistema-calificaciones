'use client';

import { Loader2, Calculator, RefreshCw, Download } from 'lucide-react';
import { usePromedioTrimestre } from '@/lib/hooks/usePromedioTrimestre';
import { useReportes } from '@/lib/hooks/useReportes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { toast } from 'sonner';
import { TrimestreEstado } from '@/lib/types';
import { BotonReporte } from '@/lib/components/features/reportes/BotonReporte';

interface TablaPromedioTrimestreProps {
  materia_curso_id: string;
  trimestre_id: string;
  estudiantes: Array<{ id: string; nombres_completos: string }>;
  porcentajes: {
    insumos: number;
    proyecto: number;
    examen: number;
  };
  isAdmin: boolean;
  trimestreEstado: TrimestreEstado;
  materia_nombre: string;
  trimestre_nombre: string;
}

export function TablaPromedioTrimestre({
  materia_curso_id,
  trimestre_id,
  estudiantes,
  porcentajes,
  isAdmin,
  trimestreEstado,
  materia_nombre,
  trimestre_nombre,
}: TablaPromedioTrimestreProps) {
  const {
    promedios,
    isLoading,
    generarPromedios,
    isGenerando
  } = usePromedioTrimestre(materia_curso_id, trimestre_id);

  // IMPORTANTE: Usamos tu hook useReportes
  const { descargarReporteMateria, descargando } = useReportes();

  const handleGenerarPromedios = () => {
    if (trimestreEstado !== TrimestreEstado.FINALIZADO) {
      toast.error('Solo se pueden generar promedios de trimestres finalizados');
      return;
    }
    generarPromedios({ trimestre_id });
  };

  const calcularPromedios = () => {
    if (promedios.length === 0) {
      return {
        promedio_insumos: null, ponderado_insumos: null,
        nota_proyecto: null, ponderado_proyecto: null,
        nota_examen: null, ponderado_examen: null,
        nota_final: null
      };
    }

    const calcularPromedioCampo = (campo: keyof typeof promedios[0]): number | null => {
      const valores = promedios
        .map(p => p[campo])
        .filter((v): v is number => v !== null && v !== undefined && !isNaN(Number(v)));

      if (valores.length === 0) return null;
      const suma = valores.reduce((acc, val) => acc + Number(val), 0);
      return suma / valores.length;
    };

    return {
      promedio_insumos: calcularPromedioCampo('promedio_insumos'),
      ponderado_insumos: calcularPromedioCampo('ponderado_insumos'),
      nota_proyecto: calcularPromedioCampo('nota_proyecto'),
      ponderado_proyecto: calcularPromedioCampo('ponderado_proyecto'),
      nota_examen: calcularPromedioCampo('nota_examen'),
      ponderado_examen: calcularPromedioCampo('ponderado_examen'),
      nota_final: calcularPromedioCampo('nota_final_trimestre')
    };
  };

  const promediosCurso = calcularPromedios();

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-900" />
            <CardTitle className="text-purple-900">
              Promedio Trimestral
            </CardTitle>
            <span className="text-sm font-normal text-purple-700">
              ({porcentajes.insumos}% Insumos + {porcentajes.proyecto}% Proyecto + {porcentajes.examen}% Examen)
            </span>
          </div>

          <div className="flex gap-2">
            {/* BOTÓN ESTANDARIZADO DE REPORTE */}
            {!isAdmin && promedios.length > 0 && (
              <BotonReporte
                label="Descargar Reporte"
                icon={Download}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md border-0"
                onClick={() => descargarReporteMateria(materia_curso_id, trimestre_id)}
                loading={descargando}
                tooltip={`Descargar reporte de ${materia_nombre}`}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                <TableHead className="sticky left-0 z-20 bg-gray-100 text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">#</TableHead>
                <TableHead className="sticky left-[60px] z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[380px] min-w-[380px] max-w-[380px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">NOMBRE</TableHead>
                <TableHead className="border-x border-gray-300 text-center bg-orange-50 w-[120px] font-semibold text-gray-900">Insumos</TableHead>
                <TableHead className="border-x border-gray-300 text-center bg-orange-50 w-[100px] font-semibold text-gray-900">
                  <div className="text-xs text-gray-600 font-normal">PONDERADO</div>
                  <div className="text-xs text-orange-600 font-bold">{porcentajes.insumos}%</div>
                </TableHead>
                <TableHead className="border-x border-gray-300 text-center bg-blue-50 w-[100px] font-semibold text-gray-900">Proyecto Integrador</TableHead>
                <TableHead className="border-x border-gray-300 text-center bg-blue-50 w-[100px] font-semibold text-gray-900">
                  <div className="text-xs text-gray-600 font-normal">PONDERADO</div>
                  <div className="text-xs text-blue-600 font-bold">{porcentajes.proyecto}%</div>
                </TableHead>
                <TableHead className="border-x border-gray-300 text-center bg-green-50 w-[100px] font-semibold text-gray-900">Prueba Estructurada</TableHead>
                <TableHead className="border-x border-gray-300 text-center bg-green-50 w-[100px] font-semibold text-gray-900">
                  <div className="text-xs text-gray-600 font-normal">PONDERADO</div>
                  <div className="text-xs text-green-600 font-bold">{porcentajes.examen}%</div>
                </TableHead>
                <TableHead className="border-l-2 border-gray-400 text-center bg-purple-50 w-[150px] font-semibold text-gray-900">
                  <div>NOTA FINAL</div>
                  <div className="text-xs text-purple-600 font-bold">CUALITATIVA</div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {estudiantes.map((estudiante, index) => {
                const promedio = promedios.find(p => p.estudiante_id === estudiante.id);
                return (
                  <TableRow key={estudiante.id} className="hover:bg-cyan-50 transition-colors border-b border-gray-300">
                    <TableCell className="sticky left-0 z-10 bg-white text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">{index + 1}</TableCell>
                    <TableCell className="sticky left-[60px] z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] font-medium px-4 border-r-2 border-gray-400">
                      <span className="text-sm">{estudiante.nombres_completos}</span>
                    </TableCell>

                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-orange-50">
                      {promedio?.promedio_insumos !== null && promedio?.promedio_insumos !== undefined ? Number(promedio.promedio_insumos).toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-orange-50">
                      {promedio?.ponderado_insumos !== null && promedio?.ponderado_insumos !== undefined ? Number(promedio.ponderado_insumos).toFixed(2) : '-'}
                    </TableCell>

                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-blue-50">
                      {promedio?.nota_proyecto !== null && promedio?.nota_proyecto !== undefined ? Number(promedio.nota_proyecto).toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-blue-50">
                      {promedio?.ponderado_proyecto !== null && promedio?.ponderado_proyecto !== undefined ? Number(promedio.ponderado_proyecto).toFixed(2) : '-'}
                    </TableCell>

                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-green-50">
                      {promedio?.nota_examen !== null && promedio?.nota_examen !== undefined ? Number(promedio.nota_examen).toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="border-x border-gray-300 text-center font-semibold bg-green-50">
                      {promedio?.ponderado_examen !== null && promedio?.ponderado_examen !== undefined ? Number(promedio.ponderado_examen).toFixed(2) : '-'}
                    </TableCell>

                    <TableCell className="border-l-2 border-gray-400 text-center bg-purple-50">
                      {promedio ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-bold text-lg ${Number(promedio.nota_final_trimestre) >= 7 ? 'text-green-700' : Number(promedio.nota_final_trimestre) >= 4 ? 'text-yellow-700' : 'text-red-700'}`}>
                            {Number(promedio.nota_final_trimestre).toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${getColorCualitativo(promedio.cualitativa)}`}>
                            {promedio.cualitativa}
                          </span>
                        </div>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}

              <TableRow className="bg-gradient-to-r from-gray-200 to-gray-300 border-t-2 border-gray-400 font-bold">
                <TableCell className="sticky left-0 z-10 bg-gradient-to-r from-gray-200 text-center border-r-2 border-gray-400"></TableCell>
                <TableCell className="sticky left-[60px] z-10 bg-gradient-to-r from-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] px-4 border-r-2 border-gray-400">PROMEDIOS</TableCell>
                <TableCell className="border-x border-gray-300 text-center bg-orange-100">{promediosCurso.promedio_insumos?.toFixed(2) || '-'}</TableCell>
                <TableCell className="border-x border-gray-300 text-center bg-orange-100">{promediosCurso.ponderado_insumos?.toFixed(2) || '-'}</TableCell>
                <TableCell className="border-x border-gray-300 text-center bg-blue-100">{promediosCurso.nota_proyecto?.toFixed(2) || '-'}</TableCell>
                <TableCell className="border-x border-gray-300 text-center bg-blue-100">{promediosCurso.ponderado_proyecto?.toFixed(2) || '-'}</TableCell>
                <TableCell className="border-x border-gray-300 text-center bg-green-100">{promediosCurso.nota_examen?.toFixed(2) || '-'}</TableCell>
                <TableCell className="border-x border-gray-300 text-center bg-green-100">{promediosCurso.ponderado_examen?.toFixed(2) || '-'}</TableCell>
                <TableCell className="border-l-2 border-gray-400 text-center bg-purple-100">{promediosCurso.nota_final?.toFixed(2) || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}