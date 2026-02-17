import { useState, useEffect } from 'react';
import { CreateMatriculaDto, OrigenMatricula } from '@/lib/types/matricula.types';
import { usePeriodos } from '@/lib/hooks/usePeriodos';
import { useCursos } from '@/lib/hooks/useCursos';
import { toast } from 'sonner';

interface ModalCrearManualProps {
  onClose: () => void;
  onSave: (data: CreateMatriculaDto) => Promise<void>;
}

export function ModalCrearManual({ onClose, onSave }: ModalCrearManualProps) {
  const { periodos, fetchPeriodos } = usePeriodos();
  const { cursos, fetchCursos } = useCursos();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateMatriculaDto>({
    estudiante_cedula: '',
    nombres_completos: '',
    estudiante_email: '',
    curso_id: '',
    periodo_lectivo_id: '',
    origen: OrigenMatricula.MANUAL
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPeriodos();
    fetchCursos();
  }, []);

  const handleChange = (field: keyof CreateMatriculaDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.estudiante_cedula || formData.estudiante_cedula.length > 13 || formData.estudiante_cedula.length < 6) {
      newErrors.estudiante_cedula = 'La cédula debe tener mínimo 6 y máximo 13 dígitos';
    }

    if (!formData.nombres_completos || formData.nombres_completos.length < 3) {
      newErrors.nombres_completos = 'Los nombres completos son requeridos';
    }

    if (formData.estudiante_email && formData.estudiante_email.trim() !== '') {
      if (!formData.estudiante_email.includes('@')) {
        newErrors.estudiante_email = 'El correo electrónico no es válido';
      }
    }

    if (!formData.periodo_lectivo_id) {
      newErrors.periodo_lectivo_id = 'Debe seleccionar un período lectivo';
    }

    if (!formData.curso_id) {
      newErrors.curso_id = 'Debe seleccionar un curso';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const dataToSend: CreateMatriculaDto = {
        ...formData,
        estudiante_email: formData.estudiante_email?.trim() || undefined
      };
      await onSave(dataToSend);
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear matrícula';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-user-plus"></i>
              Nueva Matrícula Manual
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período Lectivo <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.periodo_lectivo_id}
              onChange={(e) => handleChange('periodo_lectivo_id', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.periodo_lectivo_id ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Seleccione un período</option>
              {periodos.filter(p => p.estado === 'ACTIVO').map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
            {errors.periodo_lectivo_id && (
              <p className="text-red-500 text-xs mt-1">{errors.periodo_lectivo_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curso <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.curso_id}
              onChange={(e) => handleChange('curso_id', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.curso_id ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Seleccione un curso</option>
              {cursos.filter(c => c.estado === 'ACTIVO').map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nivel} {curso.paralelo} - {curso.especialidad}
                </option>
              ))}
            </select>
            {errors.curso_id && (
              <p className="text-red-500 text-xs mt-1">{errors.curso_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cédula del Estudiante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={13}
              value={formData.estudiante_cedula}
              onChange={(e) => handleChange('estudiante_cedula', e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890"
              className={`w-full px-4 py-2 border rounded-lg ${errors.estudiante_cedula ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.estudiante_cedula && (
              <p className="text-red-500 text-xs mt-1">{errors.estudiante_cedula}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombres Completos<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombres_completos.toUpperCase()}
              onChange={(e) => handleChange('nombres_completos', e.target.value.toUpperCase())}
              placeholder="Apellidos y Nombres"
              className={`w-full px-4 py-2 border rounded-lg ${errors.nombres_completos ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.nombres_completos && (
              <p className="text-red-500 text-xs mt-1">{errors.nombres_completos}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Institucional (Opcional)
            </label>
            <input
              type="email"
              value={formData.estudiante_email}
              onChange={(e) => handleChange('estudiante_email', e.target.value)}
              placeholder="estudiante@institucion.edu.ec"
              className={`w-full px-4 py-2 border rounded-lg ${errors.estudiante_email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.estudiante_email && (
              <p className="text-red-500 text-xs mt-1">{errors.estudiante_email}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Matrícula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}