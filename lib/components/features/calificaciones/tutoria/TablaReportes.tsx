'use client';

import { useEffect, useState } from 'react';
import { FileText, FileStack, BarChart3, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { useReportes } from '@/lib/hooks/useReportes';
import { BotonReporte } from '@/lib/components/features/reportes/BotonReporte';
import { Role, TrimestreEstado } from '@/lib/types';

interface TablaReportesProps {
  estudiantes: Array<{
    id: string;
    nombres_completos: string;
  }>;
  trimestre_id: string;
  trimestre_nombre: string;
  trimestre_estado: TrimestreEstado;
  curso_id: string;
}

export function TablaReportes({
  estudiantes,
  trimestre_id,
  trimestre_nombre,
  trimestre_estado,
  curso_id
}: TablaReportesProps) {
  const trimestreFinalizado = trimestre_estado === TrimestreEstado.FINALIZADO;
  const [isAdmin, setIsAdmin] = useState(false);

  const { 
    descargarLibretaIndividual, 
    descargarLibretasCurso, 
    descargarConcentradoCalificaciones 
  } = useReportes();

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsAdmin(parsedUser.rol === Role.ADMIN);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Libretas Individuales - {trimestre_nombre}</h3>
              <p className="text-sm text-gray-600">
                {trimestreFinalizado
                  ? 'Descarga los reportes de calificaciones de cada estudiante'
                  : 'Las libretas estarán disponibles cuando el trimestre esté finalizado'}
              </p>
            </div>
          </div>

          {trimestreFinalizado && !isAdmin && (
            <div className="flex flex-wrap gap-3">
              {/* BOTÓN CONCENTRADO / SÁBANA */}
              <BotonReporte
                label="Concentrado de Calificaciones"
                icon={BarChart3}
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold shadow-md border-0"
                onClick={() => descargarConcentradoCalificaciones(curso_id, trimestre_id)}
                loading={false} // El loading lo maneja internamente si lo ajustamos, pero aquí useReportes ya tiene su estado
              />

              {/* BOTÓN CONSOLIDADO (TODOS LOS PDFS) */}
              <BotonReporte
                label="Descargar Todas las Libretas"
                icon={FileStack}
                variant="default"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-md border-0"
                onClick={() => descargarLibretasCurso(curso_id, trimestre_id, trimestre_nombre)}
                loading={false}
              />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b-2 border-gray-400 hover:bg-gray-100">
              <TableHead className="text-center w-[60px] font-semibold border-r-2 border-gray-400">#</TableHead>
              <TableHead className="w-[400px] font-semibold border-r-2 border-gray-400">Estudiante</TableHead>
              <TableHead className="text-center w-[180px] font-semibold border-x-2 border-gray-400">Estado</TableHead>
              <TableHead className="text-center w-[200px] font-semibold border-l-2 border-gray-400">Acción</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {estudiantes.map((estudiante, index) => (
              <TableRow key={estudiante.id} className="border-b border-gray-300 hover:bg-blue-50/50 transition-colors">
                <TableCell className="text-center border-r-2 border-gray-400 font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium border-r-2 border-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {estudiante.nombres_completos.charAt(0)}
                    </div>
                    {estudiante.nombres_completos}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {trimestreFinalizado ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                      DISPONIBLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400 italic border border-gray-200">
                      PENDIENTE
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center border-l-2 border-gray-400">
                  {trimestreFinalizado && (
                    <BotonReporte
                      label="Libreta"
                      tooltip={`Descargar libreta de ${estudiante.nombres_completos}`}
                      icon={Download}
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      onClick={() => descargarLibretaIndividual(estudiante.id, trimestre_id, estudiante.nombres_completos)}
                      loading={false} // El hook useReportes ya dispara el toast de carga
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}