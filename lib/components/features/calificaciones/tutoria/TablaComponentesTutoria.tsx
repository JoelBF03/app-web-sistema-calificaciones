// nextjs-frontend/lib/components/features/tutoria/TablaComponentesTutoria.tsx
'use client';

import { useState } from 'react';
import { BookOpen, Loader2, Save } from 'lucide-react';
import { ModalEditarDatosPersonales } from './ModalEditarDatosPersonales';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { toast } from 'sonner';
import { TrimestreEstado } from '@/lib/types';

interface TablaComponentesTutoriaProps {
  curso_id: string;
  trimestre_id: string;
  estudiantes: Array<{ 
    id: string; 
    nombres_completos: string;
    estudiante: any;
  }>;
  trimestreEstado?: TrimestreEstado;
}

// ✅ Hardcodeado: Componentes secundarios típicos
const COMPONENTES_SECUNDARIOS = [
  { id: 'comportamiento', nombre: 'Comportamiento', color: 'text-purple-600' },
  { id: 'ovp', nombre: 'OVP', color: 'text-blue-600' },
  { id: 'tutoria', nombre: 'Tutoría', color: 'text-green-600' },
  { id: 'animacion_lectora', nombre: 'Animación Lectora', color: 'text-orange-600' },
];

export function TablaComponentesTutoria({ 
  curso_id, 
  trimestre_id, 
  estudiantes,
  trimestreEstado 
}: TablaComponentesTutoriaProps) {
  const estadoFinalizado = trimestreEstado === TrimestreEstado.FINALIZADO;
  const [notasTemp, setNotasTemp] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  
  // ✅ Estado para modal de edición de datos
  const [modalEdicion, setModalEdicion] = useState<{
    open: boolean;
    estudiante: any;
  } | null>(null);

  const handleNotaChange = (estudianteId: string, componenteId: string, value: string) => {
    if (value === '') {
      setNotasTemp(prev => ({
        ...prev,
        [estudianteId]: {
          ...prev[estudianteId],
          [componenteId]: ''
        }
      }));
      return;
    }

    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    const numero = parseFloat(value);
    if (!isNaN(numero) && (numero < 0 || numero > 10)) return;

    setNotasTemp(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [componenteId]: value
      }
    }));
  };

  const handleGuardar = async () => {
    // TODO: Implementar guardado cuando se cree el backend
    toast.info('Funcionalidad de guardado próximamente');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-full p-2">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Componentes Secundarios</h3>
              <p className="text-sm text-gray-600">
                Evaluación de actitudes y habilidades complementarias
              </p>
            </div>
          </div>
          {!estadoFinalizado && (
            <Button
              onClick={handleGuardar}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
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
              <TableHead className="w-[300px] min-w-[300px] max-w-[300px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                Estudiante
              </TableHead>
              {COMPONENTES_SECUNDARIOS.map((componente) => (
                <TableHead 
                  key={componente.id}
                  className="border-x border-gray-300 text-center w-[150px] min-w-[150px] font-semibold text-gray-900"
                >
                  <div className={`${componente.color} font-bold`}>
                    {componente.nombre}
                  </div>
                  <div className="text-xs text-gray-500 font-normal">/10</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {estudiantes.map((estudiante, index) => (
              <TableRow key={estudiante.id} className="border-b border-gray-300 hover:bg-purple-50">
                {/* Número */}
                <TableCell className="text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                  {index + 1}
                </TableCell>

                {/* Nombre del estudiante con hover para editar */}
                <TableCell className="font-medium px-4 border-r-2 border-gray-400">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:text-purple-600 transition-colors group"
                    onClick={() => setModalEdicion({ open: true, estudiante: estudiante.estudiante })}
                    title="Click para editar datos personales"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center font-bold text-white text-sm group-hover:scale-110 transition-transform">
                      {estudiante.nombres_completos.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm group-hover:underline">
                      {estudiante.nombres_completos}
                    </span>
                  </div>
                </TableCell>

                {/* Componentes */}
                {COMPONENTES_SECUNDARIOS.map((componente) => (
                  <TableCell key={componente.id} className="border-x border-gray-300 text-center px-2 py-2">
                    {estadoFinalizado ? (
                      <span className="font-bold text-gray-900">-</span>
                    ) : (
                      <Input
                        type="text"
                        value={notasTemp[estudiante.id]?.[componente.id] ?? ''}
                        onChange={(e) => handleNotaChange(estudiante.id, componente.id, e.target.value)}
                        placeholder="0.00"
                        className="w-full max-w-[100px] mx-auto text-center border-2 border-gray-300 focus:border-purple-500 rounded-lg"
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Editar Datos Personales */}
      {modalEdicion && (
        <ModalEditarDatosPersonales
          estudiante={modalEdicion.estudiante}
          onClose={() => setModalEdicion(null)}
        />
      )}
    </div>
  );
}