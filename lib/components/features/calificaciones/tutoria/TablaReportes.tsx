// nextjs-frontend/lib/components/features/calificaciones/tutoria/TablaReportes.tsx
'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, Loader2, CheckCircle2, XCircle, FileStack, BarChart3 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { reportesService } from '@/lib/services/reportes.services';
import { useReportes } from '@/lib/hooks/useReportes';
import { toast } from 'sonner';
import { Role, TrimestreEstado } from '@/lib/types';

interface TablaReportesProps {
  estudiantes: Array<{
    id: string;
    nombres_completos: string;
  }>;
  promedios: Array<{
    estudiante_id: string;
    [key: string]: any;
  }>;
  trimestre_id: string;
  trimestre_nombre: string;
  trimestre_estado: TrimestreEstado;
  curso_id: string;
}

export function TablaReportes({
  estudiantes,
  promedios,
  trimestre_id,
  trimestre_nombre,
  trimestre_estado,
  curso_id
}: TablaReportesProps) {
  const [descargando, setDescargando] = useState<string | null>(null);
  const [descargandoConsolidado, setDescargandoConsolidado] = useState(false);
  const trimestreFinalizado = trimestre_estado === TrimestreEstado.FINALIZADO;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  const { descargarConcentradoCalificaciones, descargando: descargandoConcentrado } = useReportes();

  // Verificar si un estudiante tiene promedio registrado
  const tienePromedio = (estudiante_id: string): boolean => {
    return promedios.some(p => p.estudiante_id === estudiante_id);
  };

  // Verificar si hay al menos un estudiante con datos
  const hayEstudiantesConDatos = estudiantes.some(est => tienePromedio(est.id));

  const handleDescargarReporte = async (estudiante_id: string, nombres_completos: string) => {
    try {
      setDescargando(estudiante_id);

      const blob = await reportesService.descargarLibretaIndividual(estudiante_id, trimestre_id);

      const nombreArchivo = `Libreta_${nombres_completos.replace(/\s+/g, '_')}_${trimestre_nombre}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success(`Libreta de ${nombres_completos} descargada`);
    } catch (error: any) {
      console.error('Error al descargar libreta:', error);
      toast.error(error.response?.data?.message || 'Error al descargar la libreta');
    } finally {
      setDescargando(null);
    }
  };

  const handleDescargarConsolidado = async () => {
    try {
      setDescargandoConsolidado(true);

      const blob = await reportesService.descargarLibretasCursoConsolidado(curso_id, trimestre_id);

      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `Libretas_Consolidadas_${trimestre_nombre}_${fecha}.pdf`;
      reportesService.descargarBlob(blob, nombreArchivo);

      toast.success('Libretas consolidadas descargadas exitosamente');
    } catch (error: any) {
      console.error('Error al descargar libretas consolidadas:', error);
      toast.error(error.response?.data?.message || 'Error al descargar las libretas consolidadas');
    } finally {
      setDescargandoConsolidado(false);
    }
  };

  const handleDescargarConcentrado = async () => {
    await descargarConcentradoCalificaciones(
      curso_id,
      `Curso_${curso_id}`,
      trimestre_id,
      trimestre_nombre
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Libretas Individuales - {trimestre_nombre}</h3>
              <p className="text-sm text-gray-600">
                {trimestreFinalizado
                  ? 'Descarga los reportes de calificaciones de cada estudiante'
                  : 'Las libretas estarán disponibles cuando el trimestre esté finalizado'
                }
              </p>
            </div>
          </div>

          {/* ✅ DOS BOTONES: Concentrado + Consolidado */}
          {trimestreFinalizado && !isAdmin && (
            <div className="flex gap-3">
              {/* BOTÓN 1: Concentrado de Calificaciones (NUEVO) */}
              <Button
                onClick={handleDescargarConcentrado}
                disabled={descargandoConcentrado}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer"
              >
                {descargandoConcentrado ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Concentrado de Calificaciones
                  </>
                )}
              </Button>

              {/* BOTÓN 2: Libretas Consolidadas (EXISTENTE) */}
              <Button
                onClick={handleDescargarConsolidado}
                disabled={descargandoConsolidado}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer"
              >
                {descargandoConsolidado ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <FileStack className="w-4 h-4 mr-2" />
                    Descargar Todas las Libretas
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-400">
              <TableHead className="text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                #
              </TableHead>
              <TableHead className="w-[400px] min-w-[400px] max-w-[400px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                Estudiante
              </TableHead>
              <TableHead className="border-x-2 border-gray-400 text-center w-[180px] min-w-[180px] font-semibold text-gray-900">
                Estado
              </TableHead>
              <TableHead className="border-l-2 border-gray-400 text-center w-[200px] min-w-[200px] font-semibold text-gray-900">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {estudiantes.map((estudiante, index) => {
              const estaDescargando = descargando === estudiante.id;

              return (
                <TableRow
                  key={estudiante.id}
                  className={`transition-colors border-b border-gray-300 ${trimestreFinalizado ? 'hover:bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                >
                  {/* Número */}
                  <TableCell className="text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                    {index + 1}
                  </TableCell>

                  {/* Nombre del estudiante */}
                  <TableCell className="font-medium px-4 border-r-2 border-gray-400">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${trimestreFinalizado ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-400'
                        }`}>
                        {estudiante.nombres_completos.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">
                        {estudiante.nombres_completos}
                      </span>
                    </div>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="border-x border-gray-300 text-center px-2 py-2">
                    {trimestreFinalizado ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full border-2 border-green-300">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-semibold">Disponible</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border-2 border-gray-300">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Pendiente</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Acción */}
                  <TableCell className="border-l-2 border-gray-400 text-center px-2 py-2">
                    {trimestreFinalizado ? (
                      <Button
                        onClick={() => handleDescargarReporte(estudiante.id, estudiante.nombres_completos)}
                        disabled={estaDescargando || isAdmin}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold cursor-pointer"
                      >
                        {estaDescargando ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Descargando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Libreta
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Trimestre no finalizado
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}