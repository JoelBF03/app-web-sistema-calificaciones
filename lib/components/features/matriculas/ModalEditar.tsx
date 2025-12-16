'use client';

import { useState, useEffect } from 'react';
import type { Matricula } from '@/lib/types/matricula.types';
import { useCursos } from '@/lib/hooks/useCursos';
import { EstadoCurso } from '@/lib/types';

interface ModalEditarProps {
  matricula: Matricula;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}

export function ModalEditar({ matricula, onClose, onSave }: ModalEditarProps) {
  const { cursos, loading: loadingCursos, fetchCursos } = useCursos(); // 🔧 Obtener fetchCursos
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_cedula: matricula.estudiante_cedula,
    nombres_completos: matricula.nombres_completos,
    estudiante_email: matricula.estudiante_email || '',
    curso_id: matricula.curso_id,
    motivo_cambio: ''
  });

  const [cambiarCurso, setCambiarCurso] = useState(false);

  // 🔧 Cargar cursos cuando se monta el componente
  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const dataToSend: any = {};

    if (formData.estudiante_cedula && formData.estudiante_cedula !== matricula.estudiante_cedula) {
      dataToSend.estudiante_cedula = formData.estudiante_cedula;
    }

    if (formData.nombres_completos && formData.nombres_completos !== matricula.nombres_completos) {
      dataToSend.nombres_completos = formData.nombres_completos;
    }

    if (formData.estudiante_email && formData.estudiante_email !== matricula.estudiante_email) {
      dataToSend.estudiante_email = formData.estudiante_email;
    }

    if (cambiarCurso && formData.curso_id && formData.curso_id !== matricula.curso_id) {
      dataToSend.curso_id = formData.curso_id;
      
      const cursoAnterior = matricula.curso 
        ? `${matricula.curso.nivel} ${matricula.curso.paralelo} - ${matricula.curso.especialidad}`
        : 'Curso anterior';
      
      // ✅ CORREGIR: Buscar con comparación segura
      const cursoNuevo = cursos.find(c => c.id === formData.curso_id);
      const cursoNuevoNombre = cursoNuevo
        ? `${cursoNuevo.nivel} ${cursoNuevo.paralelo} - ${cursoNuevo.especialidad}`
        : 'Curso nuevo';

      console.log('🔍 Buscando curso:', {
        curso_id_buscado: formData.curso_id,
        cursos_disponibles: cursos.map(c => ({ id: c.id, nombre: `${c.nivel} ${c.paralelo}` })),
        curso_encontrado: cursoNuevo
      });

      const motivoCambio = formData.motivo_cambio 
        ? `Cambio de curso de "${cursoAnterior}" a "${cursoNuevoNombre}". Motivo: ${formData.motivo_cambio}` 
        : `Cambio de curso de "${cursoAnterior}" a "${cursoNuevoNombre}"`;
      
      const observacionesActuales = matricula.observaciones || '';
      const fecha = new Date().toLocaleString('es-EC', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      dataToSend.observaciones = observacionesActuales
        ? `${observacionesActuales}\n[${fecha}] ${motivoCambio}`
        : `[${fecha}] ${motivoCambio}`;
    }

    if (Object.keys(dataToSend).length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    console.log('📤 Datos a enviar:', dataToSend);
    console.log('🆔 ID de matrícula:', matricula.id);

    await onSave(matricula.id, dataToSend);
    onClose();
  } catch (error: any) {
    console.error('❌ Error completo:', error);
    console.error('📋 Respuesta del servidor:', error.response?.data);
    alert(error.response?.data?.message || 'Error al actualizar la matrícula');
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-edit"></i>
              Editar Matrícula
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Alerta */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <i className="fas fa-exclamation-triangle text-yellow-600 mt-1"></i>
              <div className="text-sm text-yellow-800">
                <strong>Nota:</strong> Solo se pueden editar los datos proporcionados por el distrito
              </div>
            </div>
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
            </label>
            <input
              type="text"
              value={formData.estudiante_cedula}
              onChange={(e) => setFormData({ ...formData, estudiante_cedula: e.target.value })}
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* Nombres Completos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombres Completos *
            </label>
            <input
              type="text"
              value={formData.nombres_completos}
              onChange={(e) => setFormData({ ...formData, nombres_completos: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Institucional *
            </label>
            <input
              type="email"
              value={formData.estudiante_email}
              onChange={(e) => setFormData({ ...formData, estudiante_email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          <hr className="border-gray-200" />

          {/* Cambiar de Paralelo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h6 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                <i className="fas fa-exchange-alt"></i>
                Cambiar de Paralelo
              </h6>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cambiarCurso}
                  onChange={(e) => setCambiarCurso(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {cambiarCurso && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-blue-700 mb-1">Curso Actual</label>
                  <input
                    type="text"
                    value={
                      matricula.curso
                        ? `${matricula.curso.nivel} ${matricula.curso.paralelo} - ${matricula.curso.especialidad}`
                        : '-'
                    }
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm"
                    readOnly
                  />
                </div>

                {/* 🔧 Mostrar loading mientras carga cursos */}
                {loadingCursos ? (
                  <div className="text-center py-4">
                    <i className="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
                    <p className="text-sm text-blue-700 mt-2">Cargando cursos disponibles...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs text-blue-700 mb-1">Nuevo Curso *</label>
                      <select
                        value={formData.curso_id}
                        onChange={(e) => setFormData({ ...formData, curso_id: e.target.value })}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        required={cambiarCurso}
                      >
                        <option value="">Seleccione...</option>
                        {cursos
                          .filter((c) => c.id !== matricula.curso_id && c.estado === EstadoCurso.ACTIVO)
                          .map((curso) => (
                            <option key={curso.id} value={curso.id}>
                              {curso.nivel} {curso.paralelo} - {curso.especialidad}
                            </option>
                          ))}
                      </select>
                      {/* 🔧 Mostrar mensaje si no hay cursos disponibles */}
                      {cursos.filter((c) => c.id !== matricula.curso_id && c.estado === EstadoCurso.ACTIVO).length === 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          No hay cursos activos disponibles para cambio
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-blue-700 mb-1">
                        Motivo del cambio (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.motivo_cambio}
                        onChange={(e) => setFormData({ ...formData, motivo_cambio: e.target.value })}
                        placeholder="Razón del cambio de paralelo..."
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || loadingCursos}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}