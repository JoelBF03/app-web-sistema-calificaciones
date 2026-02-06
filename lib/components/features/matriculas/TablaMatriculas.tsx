import { EstadoMatricula, type Matricula } from '@/lib/types/matricula.types';
import {
  EyeIcon,
  PencilSquareIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface TablaMatriculasProps {
  matriculas: Matricula[];
  loading: boolean;
  error: string | null;
  cursoSeleccionado?: string;
  onVerDetalles?: (matricula: Matricula) => void;
  onEditar?: (matricula: Matricula) => void;
  onRetirar?: (matricula: Matricula) => void;
}

export function TablaMatriculas({
  matriculas,
  loading,
  error,
  cursoSeleccionado,
  onVerDetalles,
  onEditar,
  onRetirar
}: TablaMatriculasProps) {

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-20">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-6xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Cargando matrículas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-20">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-6xl text-red-600 mb-4"></i>
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (matriculas.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
        <div className="px-6 py-4 border-b-2 border-gray-200">
          <h5 className="text-lg font-bold text-gray-900">
            <i className="fas fa-list text-blue-600 mr-2"></i>
            Estudiantes Matriculados
          </h5>
        </div>

        <div className="text-center py-20 text-gray-400">
          <i className="fas fa-filter text-6xl mb-4 opacity-30"></i>
          <h4 className="text-xl font-semibold text-gray-600 mb-2">
            Selecciona los filtros para ver las matrículas
          </h4>
          <p className="text-gray-500">
            Elige un período lectivo y un curso para comenzar
          </p>
        </div>
      </div>
    );
  }

  const cursoInfo = matriculas[0]?.curso;
  const cursoNombre = cursoInfo
    ? `${cursoInfo.nivel} ${cursoInfo.paralelo} - ${cursoInfo.especialidad}`
    : 'Curso';

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100">
      <div className="px-6 py-4 border-b-2 border-gray-200">
        <h5 className="text-lg font-bold text-gray-900">
          <i className="fas fa-list text-blue-600 mr-2"></i>
          Estudiantes Matriculados - {cursoNombre}
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {matriculas.length} estudiantes
          </span>
        </h5>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N°
              </th>              
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Matrícula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombres Completos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo Institucional
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matriculas.map((matricula, index) => {
              return (
                <tr
                  key={matricula.id}
                  className={`rounded-lg transition-colors
                    ${matricula.estado === EstadoMatricula.ACTIVO 
                      ? 'bg-green-100 hover:bg-green-100' 
                      : 'bg-red-100 hover:bg-red-100'
                    }
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {matricula.numero_de_matricula || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {matricula.estudiante_cedula || '⚠️ Sin cédula'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {matricula.nombres_completos || '⚠️ Sin nombre'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {matricula.estudiante_email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => onVerDetalles?.(matricula)}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>

                    {matricula.estado === EstadoMatricula.ACTIVO && (
                      <>
                      <button
                        onClick={() => onEditar?.(matricula)}
                        className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600"
                        title="Editar"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onRetirar?.(matricula)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                        title="Retirar estudiante"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Mostrando <strong>1-{matriculas.length}</strong> de{' '}
          <strong>{matriculas.length}</strong> registros
        </div>
      </div>
    </div>
  );
}