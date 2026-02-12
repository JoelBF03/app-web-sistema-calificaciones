import { Estudiante } from '@/lib/types/estudiante.types';
import { Eye, Edit, History, Undo } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card } from '@/lib/components/ui/card';
import { EstadoBadge } from './badges/EstadoBadge';
import { DatosCompletosBadge } from './badges/DatosCompletosBadge';
import { CursoActualBadge } from './badges/CursoActualBadge';
import { EstadoEstudiante } from '@/lib/types/estudiante.types';

interface TablaEstudiantesProps {
  estudiantes: Estudiante[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    lastPage: number;
  };
  onVerDetalles: (estudiante: Estudiante) => void;
  onEditar: (estudiante: Estudiante) => void;
  onVerHistorial: (estudiante: Estudiante) => void;
  onReactivar: (estudiante: Estudiante) => void;
  onPageChange: (page: number) => void;
}

export function TablaEstudiantes({
  estudiantes,
  loading,
  pagination,
  onVerDetalles,
  onEditar,
  onVerHistorial,
  onReactivar,
  onPageChange,
}: TablaEstudiantesProps) {
  if (loading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      </Card>
    );
  }

  if (estudiantes.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-600">
          <p className="text-lg font-semibold">No se encontraron estudiantes</p>
          <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      </Card>
    );
  }

  const getRowClassName = (estudiante: Estudiante) => {
    if (!estudiante || !estudiante.estado) {
      return '';
    }

    if (estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL) {
      return 'bg-gray-100 opacity-75';
    }

    if (estudiante.estado === EstadoEstudiante.RETIRADO) {
      return 'bg-red-50';
    }
    if (estudiante.estado === EstadoEstudiante.SIN_MATRICULA) {
      return 'bg-orange-50';
    }
    if (!estudiante.datos_completos) {
      return 'bg-yellow-50';
    }
    return '';
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Nombre Completo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Curso Actual
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Datos
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {estudiantes.map((estudiante) => (
              <tr
                key={estudiante.id}
                className={`hover:bg-gray-50 transition-colors ${getRowClassName(estudiante)}`}
              >
                <td className="px-6 py-4">
                  <EstadoBadge estado={estudiante.estado} />
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {estudiante.nombres_completos}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <CursoActualBadge estudiante={estudiante} />
                </td>

                <td className="px-6 py-4 text-center">
                  <DatosCompletosBadge completos={estudiante.datos_completos} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onVerDetalles(estudiante)}
                      title="Ver Detalles"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditar(estudiante)}
                      title="Editar"
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onVerHistorial(estudiante)}
                      title="Historial"
                      className="text-purple-600 hover:bg-purple-50"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    {(estudiante.estado === EstadoEstudiante.RETIRADO ||
                      (estudiante.estado === EstadoEstudiante.SIN_MATRICULA &&
                        estudiante.matriculas?.some(m => m.estado === 'RETIRADO'))) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReactivar(estudiante)}
                          title="Reactivar"
                          className="text-orange-600 hover:bg-orange-50"
                        >
                          <Undo className="w-4 h-4" />
                        </Button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Mostrando{' '}
          <span className="font-semibold">
            {(pagination.page - 1) * 20 + 1}-
            {Math.min(pagination.page * 20, pagination.total)}
          </span>{' '}
          de <span className="font-semibold">{pagination.total}</span> estudiantes
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </Button>

          {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
            let pageNum;
            if (pagination.lastPage <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.lastPage - 2) {
              pageNum = pagination.lastPage - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.lastPage}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </Card>
  );
}