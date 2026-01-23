'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { Loader2, BookCheck, Lock, CheckCircle2, Save, Eye, XCircle, AlertCircle, TrendingUp, FileText } from 'lucide-react';
import { useEstudiantesSupletorio } from '@/lib/hooks/usePromediosPeriodo';
import { EstadoSupletorio } from '@/lib/types/periodo.types';
import { toast } from 'sonner';
import { calcularCualitativo, getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { ModalDetalleSupletorio } from './ModalDetalleSupletorio';
import { useReportes } from '@/lib/hooks/useReportes';

interface TablaSupletoriosProps {
  materia_curso_id: string;
  periodo_lectivo_id: string;
  estadoSupletorio: EstadoSupletorio;
  materia_nombre: string;
  periodo_nombre: string;
}

export function TablaSupletorios({
  materia_curso_id,
  periodo_lectivo_id,
  estadoSupletorio,
  materia_nombre,
  periodo_nombre
}: TablaSupletoriosProps) {
  const {
    estudiantes,
    total,
    isLoading,
    registrarSupletorio,
    isRegistering,
    refetch
  } = useEstudiantesSupletorio(materia_curso_id, periodo_lectivo_id);

  const [notasTemp, setNotasTemp] = useState<Record<string, string>>({});
  const [estudianteEnEdicion, setEstudianteEnEdicion] = useState<string | null>(null);

  const supletoriosCerrados = estadoSupletorio === EstadoSupletorio.CERRADO;
  const supletoriosActivos = estadoSupletorio === EstadoSupletorio.ACTIVADO;
  const { descargarRendimientoAnual, descargando: descargandoReporte } = useReportes();


  const [modalDetalle, setModalDetalle] = useState<{
    open: boolean;
    promedio_id: string;
    estudiante_nombre: string;
  } | null>(null);

  const handleNotaChange = (promedioId: string, value: string) => {
    if (value === '') {
      setNotasTemp(prev => ({ ...prev, [promedioId]: '' }));
      return;
    }

    // Validar formato: solo números y punto decimal (máximo 2 decimales)
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    const numero = parseFloat(value);
    // Validar rango: 0-10.00 (máximo permitido para supletorio)
    if (!isNaN(numero) && (numero < 0 || numero > 10.00)) return;

    setNotasTemp(prev => ({ ...prev, [promedioId]: value }));
  };

  const handleGuardarNota = async (promedioId: string, notaSupletorioInput: string) => {
    const nota = parseFloat(notaSupletorioInput);

    if (isNaN(nota) || nota < 0 || nota > 10.00) {
      toast.error('La nota debe estar entre 0 y 10.00');
      return;
    }

    setEstudianteEnEdicion(promedioId);

    try {
      await registrarSupletorio({
        id: promedioId,
        data: { nota_supletorio: nota }
      });

      setNotasTemp(prev => {
        const newTemp = { ...prev };
        delete newTemp[promedioId];
        return newTemp;
      });

      refetch();
    } finally {
      setEstudianteEnEdicion(null);
    }
  };

  const handleDescargarRendimientoAnual = async () => {
    await descargarRendimientoAnual(
      materia_curso_id,
      materia_nombre,
      periodo_lectivo_id,
      periodo_nombre
    );
  };

  const calcularPromedioFinal = (promedioAnual: number, notaSupletorio: string) => {
    const nota = parseFloat(notaSupletorio);
    if (isNaN(nota)) return null;

    const promedioCalculado = (promedioAnual + nota) / 2;
    // Aplicar tope de 7.00 si aprueba
    return promedioCalculado >= 7.0 ? 7.0 : promedioCalculado;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }


  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-300">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <BookCheck className="h-5 w-5" />
            Exámenes Supletorios
            {total > 0 && (
              <Badge className="ml-2 bg-orange-500 hover:bg-orange-600">
                {total} {total === 1 ? 'estudiante' : 'estudiantes'}
              </Badge>
            )}
          </CardTitle>

          {/* ✅ Botón de Reporte - Solo visible cuando supletorios CERRADOS */}
          {estadoSupletorio === EstadoSupletorio.CERRADO && (
            <Button
              onClick={handleDescargarRendimientoAnual}
              disabled={descargandoReporte}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer"
            >
              {descargandoReporte ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Reporte de Rendimiento Anual
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Alertas según estado */}
        <div className="p-6 space-y-3">
          {supletoriosCerrados && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Lock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                El período de supletorios está cerrado. No se pueden realizar cambios.
              </AlertDescription>
            </Alert>
          )}

          {supletoriosActivos && total === 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-semibold">
                ¡Excelente! No hay estudiantes en supletorio en esta materia.
              </AlertDescription>
            </Alert>
          )}

          {supletoriosActivos && total > 0 && (
            <Alert className="bg-orange-50 border-orange-300">
              <BookCheck className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Importante:</strong> Si el estudiante aprueba con una nota mayor, se registrará como 7.00.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Tabla */}
        {total > 0 && (
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                  <TableHead className="sticky left-0 z-20 bg-gray-100 text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                    #
                  </TableHead>
                  <TableHead className="sticky left-[60px] z-20 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] w-[350px] min-w-[350px] max-w-[350px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                    Estudiante
                  </TableHead>
                  <TableHead className="border-x border-gray-300 text-center bg-red-50 w-[120px] min-w-[120px] font-semibold text-gray-900">
                    <div>Promedio Anual</div>
                    <div className="text-xs text-gray-600 font-normal">(3 Trimestres)</div>
                  </TableHead>
                  <TableHead className="border-x border-gray-300 text-center bg-orange-50 w-[180px] min-w-[180px] font-semibold text-gray-900">
                    <div>Nota Supletorio</div>
                  </TableHead>
                  <TableHead className="border-x border-gray-300 text-center bg-green-50 w-[120px] min-w-[120px] font-semibold text-gray-900">
                    <div>Promedio Final</div>
                    <div className="text-xs text-gray-600 font-normal">(Con Tope 7.00)</div>
                  </TableHead>
                  <TableHead className="border-x border-gray-300 text-center bg-blue-50 w-[100px] min-w-[100px] font-semibold text-gray-900">
                    Cualitativa
                  </TableHead>
                  <TableHead className="border-l-2 border-gray-400 text-center w-[150px] min-w-[150px] font-semibold text-gray-900">
                    Estado
                  </TableHead>
                  <TableHead className="border-l border-gray-300 text-center w-[180px] min-w-[180px] font-semibold text-gray-900">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {estudiantes.map((promedio, index) => {
                  // 🔧 PARSEAR VALORES DECIMALES QUE VIENEN COMO STRING DESDE TYPEORM
                  const promedioAnual = parseFloat(promedio.promedio_anual as any);
                  const notaSupletorio = promedio.nota_supletorio ? parseFloat(promedio.nota_supletorio as any) : null;
                  const promedioFinal = promedio.promedio_final ? parseFloat(promedio.promedio_final as any) : null;

                  const tieneSupletorio = notaSupletorio !== null;
                  const notaTemp = notasTemp[promedio.id] || '';
                  const promedioFinalTemp = notaTemp ? calcularPromedioFinal(promedioAnual, notaTemp) : null;
                  const cualitativaTemp = promedioFinalTemp ? calcularCualitativo(promedioFinalTemp) : null;
                  const estaEditando = estudianteEnEdicion === promedio.id;

                  return (
                    <TableRow
                      key={promedio.id}
                      className="hover:bg-orange-50 transition-colors border-b border-gray-300"
                    >
                      {/* Número */}
                      <TableCell className="sticky left-0 z-10 bg-white hover:bg-orange-50 transition-colors text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                        {index + 1}
                      </TableCell>

                      {/* Nombre */}
                      <TableCell className="sticky left-[60px] z-10 bg-white hover:bg-orange-50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] font-medium px-4 border-r-2 border-gray-400">
                        <span className="text-sm">{promedio.estudiante.nombres_completos}</span>
                      </TableCell>

                      {/* Promedio Anual */}
                      <TableCell className="border-x border-gray-300 text-center bg-red-50 px-3 py-2">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-red-700 text-lg">
                            {promedioAnual.toFixed(2)}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {promedio.cualitativa_anual}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Nota Supletorio */}

                      <TableCell className="border-x border-gray-300 text-center px-2 py-2">
                        {tieneSupletorio ? (
                          // ✅ YA TIENE NOTA REGISTRADA - SOLO MOSTRAR
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-semibold text-lg ${notaSupletorio >= 7 ? 'text-green-700' :
                              notaSupletorio >= 4 ? 'text-yellow-700' :
                                'text-red-700'
                              }`}>
                              {notaSupletorio.toFixed(2)}
                            </span>
                            {supletoriosCerrados && (
                              <Lock className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        ) : (
                          // ✅ NO TIENE NOTA - PERMITIR INGRESO
                          supletoriosActivos ? (
                            <Input
                              type="text"
                              value={notaTemp}
                              onChange={(e) => handleNotaChange(promedio.id, e.target.value)}
                              placeholder="0.00"
                              className="w-24 text-center font-semibold"
                              disabled={estaEditando}
                            />
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )
                        )}
                      </TableCell>


                      {/* Promedio Final */}
                      <TableCell className="border-x border-gray-300 text-center bg-green-50 px-3 py-2">
                        {tieneSupletorio && promedioFinal !== null ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold text-lg ${promedioFinal >= 7 ? 'text-green-700' : 'text-red-700'
                              }`}>
                              {promedioFinal.toFixed(2)}
                            </span>
                            {promedioFinal >= 7 && (
                              <Badge className="text-xs bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Aprobado
                              </Badge>
                            )}
                          </div>
                        ) : promedioFinalTemp !== null ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold text-lg ${promedioFinalTemp >= 7 ? 'text-green-700' : 'text-red-700'
                              }`}>
                              {promedioFinalTemp.toFixed(2)}
                            </span>
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Cualitativa */}
                      <TableCell className="border-x border-gray-300 text-center bg-blue-50 px-3 py-2">
                        {tieneSupletorio && promedio.cualitativa_final ? (
                          <Badge variant={
                            promedio.cualitativa_final === 'DA' ? 'default' :
                              promedio.cualitativa_final === 'AA' ? 'secondary' :
                                'destructive'
                          } className="font-bold">
                            {promedio.cualitativa_final}
                          </Badge>
                        ) : cualitativaTemp ? (
                          <Badge variant={
                            cualitativaTemp === 'DA' ? 'default' :
                              cualitativaTemp === 'AA' ? 'secondary' :
                                'destructive'
                          } className="font-bold">
                            {cualitativaTemp}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="border-l-2 border-gray-400 text-center px-2 py-2">
                        {tieneSupletorio ? (
                          promedioFinal! >= 7 ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Aprobó
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Reprobó
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>

                      {/* Acciones */}
                      <TableCell className="border-l border-gray-300 text-center px-2 py-2">
                        {tieneSupletorio ? (
                          // ✅ BOTÓN VER DETALLE para estudiantes con nota registrada
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setModalDetalle({
                              open: true,
                              promedio_id: promedio.id,
                              estudiante_nombre: promedio.estudiante.nombres_completos
                            })}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalle
                          </Button>
                        ) : (
                          // ✅ BOTÓN GUARDAR para estudiantes sin nota
                          notaTemp && supletoriosActivos && (
                            <Button
                              onClick={() => handleGuardarNota(promedio.id, notaTemp)}
                              disabled={estaEditando}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {estaEditando ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Guardar
                                </>
                              )}
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {modalDetalle && (
              <ModalDetalleSupletorio
                promedio_id={modalDetalle.promedio_id}
                estudiante_nombre={modalDetalle.estudiante_nombre}
                open={modalDetalle.open}
                onClose={() => setModalDetalle(null)}
                onSuccess={() => {
                  refetch();
                }}
                estadoSupletorio={estadoSupletorio}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}