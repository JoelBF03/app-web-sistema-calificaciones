import { EstadoMatricula, type Matricula } from '@/lib/types/matricula.types';

interface EstadisticasMatriculasProps {
  matriculas: Matricula[];
}

export function EstadisticasMatriculas({ matriculas }: EstadisticasMatriculasProps) {
  const activas = matriculas.filter(m => m.estado === EstadoMatricula.ACTIVO).length;
  const retiradas = matriculas.filter(m => m.estado === EstadoMatricula.RETIRADO).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {activas}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              <i className="fas fa-users mr-2"></i>
              Matrículas Activas
            </div>
          </div>
          <div>
            <i className="fas fa-check-circle text-6xl text-green-600 opacity-20"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-red-600 mb-2">
              {retiradas}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              <i className="fas fa-user-times mr-2"></i>
              Retiros este período
            </div>
          </div>
          <div>
            <i className="fas fa-times-circle text-6xl text-red-600 opacity-20"></i>
          </div>
        </div>
      </div>
    </div>
  );
}