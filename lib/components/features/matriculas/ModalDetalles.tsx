import { EstadoMatricula, OrigenMatricula, type Matricula } from '@/lib/types/matricula.types';
import { formatearFecha } from '@/lib/utils/formatters';
import { useState } from 'react';

interface ModalDetallesProps {
  matricula: Matricula;
  onClose: () => void;
  onReactivar?: (matricula: Matricula) => void; 
}

export function ModalDetalles({ matricula, onClose, onReactivar }: ModalDetallesProps) {
  const [showConfirmReactivar, setShowConfirmReactivar] = useState(false);

  const handleReactivar = () => {
    if (onReactivar) {
      onReactivar(matricula);
      onClose();
    }
  };

    return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${
          matricula.estado === 'RETIRADO' 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        } text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <i className={`fas ${matricula.estado === EstadoMatricula.RETIRADO ? 'fa-user-times' : 'fa-user-circle'}`}></i>
              Detalles del Estudiante
              {matricula.estado === EstadoMatricula.RETIRADO && (
                <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                  RETIRADO
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información del Estudiante */}
          <div>
            <h6 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-user text-blue-600"></i>
              Información del Estudiante
            </h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cédula</label>
                <p className="font-semibold text-gray-900">{matricula.estudiante_cedula}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Estado</label>
                <span
                  className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                    matricula.estado === EstadoMatricula.ACTIVO
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {matricula.estado}
                </span>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Nombres Completos</label>
                <p className="font-semibold text-gray-900">{matricula.nombres_completos}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Correo Institucional</label>
                <p className="text-gray-700">{matricula.estudiante_email || '-'}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Información de Matrícula */}
          <div>
            <h6 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-600"></i>
              Información de Matrícula
            </h6>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">N° Matrícula</label>
                <p className="font-bold text-blue-600 text-lg">
                  {matricula.numero_de_matricula || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Origen</label>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    matricula.origen === 'DISTRITO'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {matricula.origen}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Período Lectivo</label>
                <p className="font-semibold text-gray-900">
                  {matricula.periodo_lectivo?.nombre || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Curso Actual</label>
                <p className="font-semibold text-gray-900">
                  {matricula.curso
                    ? `${matricula.curso.nivel} ${matricula.curso.paralelo} - ${matricula.curso.especialidad}`
                    : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Fecha de Matrícula</label>
                <p className="text-gray-700">
                  {matricula.createdAt ? formatearFecha(matricula.createdAt) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Si está retirado, mostrar info del retiro + botón reactivar */}
          {matricula.estado === EstadoMatricula.RETIRADO && (
            <>
              <hr className="border-gray-200" />
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h6 className="text-sm font-semibold text-red-800 uppercase mb-3 flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  Información del Retiro
                </h6>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-red-700 mb-1 block">Fecha de Retiro</label>
                    <p className="text-red-900 font-medium">
                      {matricula.fecha_retiro ? formatearFecha(matricula.fecha_retiro) : '-'}
                    </p>
                  </div>
                  {matricula.observaciones && (
                    <div>
                      <label className="text-xs text-red-700 mb-1 block">Motivo del Retiro</label>
                      <p className="text-red-900 text-sm whitespace-pre-wrap">{matricula.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de Reactivación */}
              {onReactivar && !showConfirmReactivar && (
                <button
                  onClick={() => setShowConfirmReactivar(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <i className="fas fa-undo"></i>
                  Reactivar Estudiante
                </button>
              )}

              {/* Confirmación de reactivación */}
              {showConfirmReactivar && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <h6 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i>
                    ¿Confirmar reactivación?
                  </h6>
                  <p className="text-sm text-yellow-700 mb-4">
                    El estudiante volverá al estado ACTIVO y se registrará en el historial.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirmReactivar(false)}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleReactivar}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Sí, reactivar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Observaciones (si no es retiro) */}
          {matricula.observaciones && matricula.estado !== EstadoMatricula.RETIRADO && (
            <>
              <hr className="border-gray-200" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Observaciones</label>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{matricula.observaciones}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}