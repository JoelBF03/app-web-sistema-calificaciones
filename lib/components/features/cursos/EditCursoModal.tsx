'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, UserCircle } from 'lucide-react';
import { Curso, NivelCurso, EspecialidadCurso, NIVEL_DISPLAY_MAP, isBasicaCurso } from '@/lib/types/curso.types';
import { EstadoPeriodo } from '@/lib/types/periodo.types';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import { useDocentes } from '@/lib/hooks/useDocentes';
import { Docente, NivelAsignado } from '@/lib/types/docente.types';
import { Estado } from '@/lib/types';
import { toast } from 'sonner';

interface EditCursoModalProps {
  curso: Curso | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: any) => Promise<void>;
}

export default function EditCursoModal({
  curso,
  isOpen,
  onClose,
  onSave
}: EditCursoModalProps) {

  const { fetchDocentes } = useDocentes();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loadingDocentes, setLoadingDocentes] = useState(false);

  const [formData, setFormData] = useState({
    nivel: '',
    paralelo: '',
    especialidad: '',
    docente_id: 'none'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDocentes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (curso) {
      setFormData({
        nivel: curso.nivel || '',
        paralelo: curso.paralelo || '',
        especialidad: curso.especialidad || '',
        docente_id: curso.docente_id ? curso.docente_id : 'none'
      });
      setErrors({});
    }
  }, [curso]);

  const cargarDocentes = async () => {
    setLoadingDocentes(true);
    try {
      const data = await fetchDocentes();
      const docentesActivos = data.filter(d => d.usuario_id?.estado === Estado.ACTIVO);
      setDocentes(docentesActivos);
    } catch (error) {
      toast.error('Error al cargar lista de docentes');
    } finally {
      setLoadingDocentes(false);
    }
  };

  if (!isOpen) return null;
  if (!curso) return null;

  const nivelesBasicos = [NivelCurso.OCTAVO, NivelCurso.NOVENO, NivelCurso.DECIMO];
  const nivelesBachillerato = [
    NivelCurso.PRIMERO_BACHILLERATO,
    NivelCurso.SEGUNDO_BACHILLERATO,
    NivelCurso.TERCERO_BACHILLERATO
  ];

  const isNivelBasico = nivelesBasicos.includes(formData.nivel as NivelCurso);
  const getDocentesDisponibles = () => {
    if (!formData.nivel) return [];

    const esBasica = isBasicaCurso(formData.nivel as NivelCurso);

    return docentes.filter(docente => {
      if (esBasica && docente.nivelAsignado === NivelAsignado.BASICA) return true;
      if (!esBasica && docente.nivelAsignado === NivelAsignado.BACHILLERATO) return true;
      return false;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nivel) {
      newErrors.nivel = 'El nivel es requerido';
    }

    if (!formData.paralelo || formData.paralelo.trim() === '') {
      newErrors.paralelo = 'El paralelo es requerido';
    } else if (!/^[A-Z]$/.test(formData.paralelo.toUpperCase())) {
      newErrors.paralelo = 'El paralelo debe ser una letra (A-Z)';
    }

    if (!formData.especialidad) {
      newErrors.especialidad = 'La especialidad es requerida';
    }

    if (isNivelBasico && formData.especialidad !== EspecialidadCurso.BASICA) {
      newErrors.especialidad = 'Los niveles de Básica solo pueden tener especialidad BÁSICA';
    }

    if (!isNivelBasico && formData.especialidad === EspecialidadCurso.BASICA) {
      newErrors.especialidad = 'Los niveles de Bachillerato deben tener especialidad TÉCNICO o CIENCIAS';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData: any = {
        nivel: formData.nivel as NivelCurso,
        paralelo: formData.paralelo.toUpperCase(),
        especialidad: formData.especialidad as EspecialidadCurso,
      };

      if (formData.docente_id === 'none') {
        updateData.docente_id = null;
      } else {
        updateData.docente_id = formData.docente_id;
      }

      await onSave(curso.id, updateData);
      onClose();
    } catch (error: any) {
      toast.error('Error al actualizar curso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNivelChange = (value: string) => {
    const nuevoNivel = value as NivelCurso;
    setFormData(prev => {
      const esBasico = nivelesBasicos.includes(nuevoNivel);
      return {
        ...prev,
        nivel: value,
        especialidad: esBasico ? EspecialidadCurso.BASICA : prev.especialidad,
        docente_id: 'none'
      };
    });
    setErrors(prev => ({ ...prev, nivel: '', especialidad: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold mb-1">Editar Curso</h2>
          <p className="text-white/80 text-sm">
            Modificar información del curso
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">

          {curso.periodo_lectivo.estado === EstadoPeriodo.ACTIVO && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Ten cuidado al editar este curso
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  El período lectivo está activo. Los cambios pueden afectar  docentes.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nivel">
              Nivel <span className="text-red-500">*</span>
            </Label>
            <Select
              key={formData.docente_id}
              value={formData.nivel}
              onValueChange={handleNivelChange}
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.nivel ? 'border-red-500' : 'cursor-pointer'}>
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">EDUCACIÓN BÁSICA</div>
                <SelectItem className="cursor-pointer" value={NivelCurso.OCTAVO}>
                  {NIVEL_DISPLAY_MAP[NivelCurso.OCTAVO]}
                </SelectItem>
                <SelectItem className="cursor-pointer" value={NivelCurso.NOVENO}>
                  {NIVEL_DISPLAY_MAP[NivelCurso.NOVENO]}
                </SelectItem>
                <SelectItem className="cursor-pointer" value={NivelCurso.DECIMO}>
                  {NIVEL_DISPLAY_MAP[NivelCurso.DECIMO]}
                </SelectItem>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">BACHILLERATO</div>
                <SelectItem className="cursor-pointer" value={NivelCurso.PRIMERO_BACHILLERATO}>
                  {NIVEL_DISPLAY_MAP[NivelCurso.PRIMERO_BACHILLERATO]}
                </SelectItem>
                <SelectItem className="cursor-pointer" value={NivelCurso.SEGUNDO_BACHILLERATO}>
                  {NIVEL_DISPLAY_MAP[NivelCurso.SEGUNDO_BACHILLERATO]}
                </SelectItem>
                <SelectItem className="cursor-pointer" value={NivelCurso.TERCERO_BACHILLERATO}>
                  {NIVEL_DISPLAY_MAP[NivelCurso.TERCERO_BACHILLERATO]}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.nivel && (
              <p className="text-sm text-red-500">{errors.nivel}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paralelo">
              Paralelo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="paralelo"
              value={formData.paralelo}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().slice(0, 1);
                setFormData(prev => ({ ...prev, paralelo: value }));
                setErrors(prev => ({ ...prev, paralelo: '' }));
              }}
              placeholder="Ej: A, B, C"
              className={errors.paralelo ? 'border-red-500' : ''}
              disabled={isSubmitting}
              maxLength={1}
            />
            {errors.paralelo && (
              <p className="text-sm text-red-500">{errors.paralelo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">
              Especialidad <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.especialidad}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, especialidad: value }));
                setErrors(prev => ({ ...prev, especialidad: '' }));
              }}
              disabled={isSubmitting || isNivelBasico}
            >
              <SelectTrigger className={errors.especialidad ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value={EspecialidadCurso.BASICA}>
                  BÁSICA
                </SelectItem>
                <SelectItem className="cursor-pointer" value={EspecialidadCurso.TECNICO}>
                  TÉCNICO
                </SelectItem>
                <SelectItem className="cursor-pointer" value={EspecialidadCurso.CIENCIAS}>
                  CIENCIAS
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.especialidad && (
              <p className="text-sm text-red-500">{errors.especialidad}</p>
            )}
            {isNivelBasico && (
              <p className="text-xs text-gray-500">
                Los niveles de Básica solo pueden tener especialidad BÁSICA.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="docente_id" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-gray-500" />
              Tutor del Curso
            </Label>
            <Select
              value={formData.docente_id}
              onValueChange={(value) => setFormData({ ...formData, docente_id: value })}
              disabled={!formData.nivel || isSubmitting || loadingDocentes}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder={
                  loadingDocentes
                    ? "Cargando docentes..."
                    : !formData.nivel
                      ? "Selecciona primero un nivel"
                      : "Selecciona un tutor (opcional)"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">Sin tutor asignado</SelectItem>
                {getDocentesDisponibles().map((docente) => (
                  <SelectItem className="cursor-pointer" key={docente.id} value={docente.id}>
                    {docente.nombres} {docente.apellidos} ({docente.nivelAsignado})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Solo se muestran docentes activos y compatibles con el nivel seleccionado
            </p>
            {curso.docente && (
              <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-2">
                <span className="font-medium text-blue-900">Tutor actual:</span>{' '}
                <span className="text-blue-700">
                  {curso.docente.nombres} {curso.docente.apellidos}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Curso Original</p>
            <p className="text-sm text-gray-900">
              <strong>{NIVEL_DISPLAY_MAP[curso.nivel]}</strong> - Paralelo <strong>{curso.paralelo}</strong> - {curso.especialidad}
            </p>
          </div>
        </form>

        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}