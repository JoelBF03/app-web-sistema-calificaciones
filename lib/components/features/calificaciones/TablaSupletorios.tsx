'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Input } from '@/lib/components/ui/input';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { Loader2, BookCheck, Save, Eye, FileText, CheckCircle2, Lock, AlertTriangle, Edit } from 'lucide-react';
import { useEstudiantesSupletorio } from '@/lib/hooks/usePromediosPeriodo';
import { EstadoSupletorio } from '@/lib/types/periodo.types';
import { toast } from 'sonner';
import { ModalDetalleSupletorio } from './ModalDetalleSupletorio';
import { useReportes } from '@/lib/hooks/useReportes';
import { BotonReporte } from '@/lib/components/features/reportes/BotonReporte';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';

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
    refetch
  } = useEstudiantesSupletorio(materia_curso_id, periodo_lectivo_id);

  // 🔥 CONTROL: Solo permitir edición cuando esté ACTIVADO
  const puedeEditar = estadoSupletorio === EstadoSupletorio.ACTIVADO;
  const estaCerrado = estadoSupletorio === EstadoSupletorio.CERRADO;
  const estaPendiente = estadoSupletorio === EstadoSupletorio.PENDIENTE;
  
  const { descargarRendimientoAnual, descargando: descargandoReporte } = useReportes();

  const [modalDetalle, setModalDetalle] = useState<{
    open: boolean;
    promedio_id: string;
    estudiante_nombre: string;
  } | null>(null);

  const [notasTemp, setNotasTemp] = useState<Record<string, string>>({});
  const [estudianteEnEdicion, setEstudianteEnEdicion] = useState<string | null>(null);

  const handleNotaChange = (promedioId: string, value: string) => {
    // 🔥 Bloquear cambios si no está ACTIVADO
    if (!puedeEditar) {
      toast.error('No se pueden registrar calificaciones. Los supletorios no están activados.');
      return;
    }

    if (value === '') {
      setNotasTemp(prev => ({ ...prev, [promedioId]: '' }));
      return;
    }
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    const numero = parseFloat(value);
    if (!isNaN(numero) && (numero < 0 || numero > 7.00)) return;
    setNotasTemp(prev => ({ ...prev, [promedioId]: value }));
  };

  const handleGuardarNota = async (promedioId: string, notaSupletorioInput: string) => {
    // 🔥 Validación extra antes de enviar
    if (!puedeEditar) {
      toast.error('No se pueden registrar calificaciones. Los supletorios deben estar ACTIVADOS.');
      return;
    }

    const nota = parseFloat(notaSupletorioInput);

    if (isNaN(nota) || nota < 0 || nota > 7.00) {
      toast.error('La nota debe estar entre 0 y 7.00');
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
      toast.success('Nota registrada correctamente');
    } catch (error: any) {
      // Mostrar mensaje de error específico del backend
      const mensajeError = error?.response?.data?.message || 'Error al registrar la nota';
      toast.error(mensajeError);
    } finally {
      setEstudianteEnEdicion(null);
    }
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
            {/* 🔥 Badge de estado */}
            {estaPendiente && (
              <Badge variant="outline" className="ml-2 text-gray-600 border-gray-400">
                Pendiente
              </Badge>
            )}
            {puedeEditar && (
              <Badge className="ml-2 bg-orange-600 text-white">
                <Edit className="h-3 w-3 mr-1" />
                Calificación Activa
              </Badge>
            )}
            {estaCerrado && (
              <Badge className="ml-2 bg-amber-600 text-white">
                <Lock className="h-3 w-3 mr-1" />
                Cerrado
              </Badge>
            )}
          </CardTitle>

          {estaCerrado && (
            <BotonReporte
              label="Reporte de Rendimiento Anual"
              icon={FileText}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md"
              onClick={() => descargarRendimientoAnual(materia_curso_id, periodo_lectivo_id)}
              loading={descargandoReporte}
              tooltip={`Descargar rendimiento anual de ${materia_nombre}`}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="p-2">
        {/* 🔥 Alertas de estado */}
        {estaPendiente && total > 0 && (
          <Alert className="mb-4 border-2 border-gray-300 bg-gray-50">
            <AlertTriangle className="h-5 w-5 text-gray-600" />
            <AlertDescription className="ml-2">
              <span className="text-gray-900 font-semibold">
                Los supletorios están PENDIENTES
              </span>
              <p className="text-gray-700 text-sm mt-1">
                El administrador debe <strong>activar la fase de supletorios</strong> para que puedas registrar calificaciones.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {estaCerrado && total !== 0 && (
          <Alert className="mb-4 border-2 border-amber-300 bg-amber-50">
            <Lock className="h-5 w-5 text-amber-600" />
            <AlertDescription className="ml-2">
              <span className="text-amber-900 font-semibold">
                Los supletorios están CERRADOS
              </span>
              <p className="text-amber-700 text-sm mt-1">
                Si necesitas corregir alguna calificación solicita al administrador que reactive los supletorios 
              </p>
            </AlertDescription>
          </Alert>
        )}

        {total === 0 ? (
          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="ml-2">
              <div className="flex flex-col gap-2">
                <span className="text-green-900 font-semibold text-lg">
                  ¡Excelente! Todos los estudiantes aprobaron la materia
                </span>
                <span className="text-green-700">
                  No hay estudiantes que requieran examen supletorio en <strong>{materia_nombre}</strong>.
                </span>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                  <TableHead className="sticky left-0 z-20 bg-gray-100 text-center w-[60px] border-r-2 border-gray-400">#</TableHead>
                  <TableHead className="sticky left-[60px] z-20 bg-gray-100 w-[350px] border-r-2 border-gray-400">Estudiante</TableHead>
                  <TableHead className="text-center bg-red-50 w-[120px]">Promedio Anual</TableHead>
                  <TableHead className="text-center bg-orange-50 w-[180px]">Nota Supletorio</TableHead>
                  <TableHead className="text-center bg-green-50 w-[120px]">Promedio Final</TableHead>
                  <TableHead className="text-center bg-blue-50 w-[100px]">Cualitativa</TableHead>
                  <TableHead className="text-center w-[150px] border-l-2 border-gray-400">Estado</TableHead>
                  <TableHead className="text-center w-[180px] border-l border-gray-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {estudiantes.map((promedio, index) => {
                  const promedioAnual = parseFloat(promedio.promedio_anual as any);
                  const notaSupletorio = promedio.nota_supletorio ? parseFloat(promedio.nota_supletorio as any) : null;
                  const promedioFinal = promedio.promedio_final ? parseFloat(promedio.promedio_final as any) : null;

                  const tieneNotaRegistrada = notaSupletorio !== null;
                  const notaInput = notasTemp[promedio.id] || '';
                  const estaEditando = estudianteEnEdicion === promedio.id;

                  return (
                    <TableRow key={promedio.id} className="hover:bg-orange-50 transition-colors border-b border-gray-300">
                      <TableCell className="sticky left-0 z-10 bg-white text-center border-r-2 border-gray-400">{index + 1}</TableCell>
                      <TableCell className="sticky left-[60px] z-10 bg-white border-r-2 border-gray-400">{promedio.estudiante.nombres_completos}</TableCell>

                      <TableCell className="text-center bg-red-50 font-bold text-red-700">
                        {promedioAnual.toFixed(2)}
                      </TableCell>

                      <TableCell className="text-center">
                        {tieneNotaRegistrada ? (
                          <span className={`font-semibold text-lg ${notaSupletorio === 7 ? 'text-green-700' : 'text-red-700'}`}>
                            {notaSupletorio.toFixed(2)}
                          </span>
                        ) : puedeEditar ? (
                          <Input
                            type="text"
                            value={notaInput}
                            onChange={(e) => handleNotaChange(promedio.id, e.target.value)}
                            placeholder="0.00"
                            className="w-20 mx-auto text-center font-semibold"
                            disabled={estaEditando}
                          />
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <Lock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">-</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center bg-green-50 font-bold text-lg">
                        {promedioFinal !== null ? (
                          <span className={promedioFinal >= 7 ? 'text-green-700' : 'text-red-700'}>
                            {promedioFinal.toFixed(2)}
                          </span>
                        ) : <span className="text-gray-400">-</span>}
                      </TableCell>

                      <TableCell className="text-center bg-blue-50">
                        {promedio.cualitativa_final ? (
                          <Badge className="font-bold">{promedio.cualitativa_final}</Badge>
                        ) : <span className="text-gray-400">-</span>}
                      </TableCell>

                      <TableCell className="border-l-2 border-gray-400 text-center">
                        {tieneNotaRegistrada ? (
                          promedioFinal! >= 7 ? (
                            <Badge className="bg-green-500">Aprobó</Badge>
                          ) : (
                            <Badge variant="destructive">Reprobó</Badge>
                          )
                        ) : <Badge variant="outline" className="text-orange-700">Pendiente</Badge>}
                      </TableCell>

                      <TableCell className="text-center">
                        {tieneNotaRegistrada || estaCerrado ? (
                          <Button 
                            size="sm" 
                            onClick={() => setModalDetalle({ 
                              open: true, 
                              promedio_id: promedio.id, 
                              estudiante_nombre: promedio.estudiante.nombres_completos 
                            })} 
                            className="bg-blue-600"
                          >
                            <Eye className="h-4 w-4 mr-2" /> Detalle
                          </Button>
                        ) : (
                          notaInput && puedeEditar && (
                            <Button 
                              onClick={() => handleGuardarNota(promedio.id, notaInput)} 
                              disabled={estaEditando} 
                              size="sm" 
                              className="bg-green-600"
                            >
                              {estaEditando ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                              Guardar
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {modalDetalle && (
        <ModalDetalleSupletorio
          promedio_id={modalDetalle.promedio_id}
          estudiante_nombre={modalDetalle.estudiante_nombre}
          open={modalDetalle.open}
          onClose={() => setModalDetalle(null)}
          onSuccess={() => refetch()}
          estadoSupletorio={estadoSupletorio}
        />
      )}
    </Card>
  );
}