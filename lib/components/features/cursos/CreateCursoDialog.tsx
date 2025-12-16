'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/lib/components/ui/dialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Alert, AlertDescription } from '@/lib/components/ui/alert';
import { AlertCircle, BookOpen, CheckCircle2, Loader2, Info, UserCircle } from 'lucide-react';
import { 
  NivelCurso, 
  EspecialidadCurso, 
  CreateCursoDto, 
  NIVEL_DISPLAY_MAP,
  isBasicaCurso 
} from '@/lib/types/curso.types';
import { useCursos } from '@/lib/hooks/useCursos';
import { usePeriodos } from '@/lib/hooks/usePeriodos';
import { useDocentes } from '@/lib/hooks/useDocentes';
import { Docente } from '@/lib/types/docente.types';
import { toast } from 'sonner';
import { Estado } from '@/lib/types/usuario.types';

interface CreateCursoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCursoDialog({
  isOpen,
  onClose,
  onSuccess
}: CreateCursoDialogProps) {
  const { crearCurso } = useCursos();
  const { obtenerPeriodoActivo } = usePeriodos();
  const { fetchDocentes } = useDocentes();

  const [loading, setLoading] = useState(false);
  const [periodoActivo, setPeriodoActivo] = useState<any>(null);
  const [loadingPeriodo, setLoadingPeriodo] = useState(false);
  const [errorPeriodo, setErrorPeriodo] = useState<string | null>(null);
  
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loadingDocentes, setLoadingDocentes] = useState(false);
  
  const [formData, setFormData] = useState({
    nivel: '' as NivelCurso,
    paralelo: 'A',
    especialidad: '' as EspecialidadCurso,
    docente_id: 'none',
  });

  useEffect(() => {
    if (isOpen) {
      cargarPeriodoActivo();
      cargarDocentes();
    } else {
      handleReset();
      setErrorPeriodo(null);
      setPeriodoActivo(null);
    }
  }, [isOpen]);

  const cargarPeriodoActivo = async () => {
    setLoadingPeriodo(true);
    setErrorPeriodo(null);
    
    try {
      const periodo = await obtenerPeriodoActivo();
      setPeriodoActivo(periodo);
      toast.success(`Período activo: ${periodo.nombre}`);
    } catch (error: any) {
      const mensaje = error.response?.data?.message 
        || error.message 
        || 'No hay un período lectivo activo';
      
      setErrorPeriodo(mensaje);
      setPeriodoActivo(null);
      toast.error(mensaje);
    } finally {
      setLoadingPeriodo(false);
    }
  };

  const cargarDocentes = async () => {
    setLoadingDocentes(true);
    try {
      const data = await fetchDocentes();
      const docentesActivos = data.filter(d => d.usuario_id?.estado === Estado.ACTIVO);
      setDocentes(docentesActivos);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      toast.error('Error al cargar lista de docentes');
    } finally {
      setLoadingDocentes(false);
    }
  };

  const nivelesBasicos = [
    { value: NivelCurso.OCTAVO, label: NIVEL_DISPLAY_MAP[NivelCurso.OCTAVO] },
    { value: NivelCurso.NOVENO, label: NIVEL_DISPLAY_MAP[NivelCurso.NOVENO] },
    { value: NivelCurso.DECIMO, label: NIVEL_DISPLAY_MAP[NivelCurso.DECIMO] },
  ];

  const nivelesBachillerato = [
    { value: NivelCurso.PRIMERO_BACHILLERATO, label: NIVEL_DISPLAY_MAP[NivelCurso.PRIMERO_BACHILLERATO] },
    { value: NivelCurso.SEGUNDO_BACHILLERATO, label: NIVEL_DISPLAY_MAP[NivelCurso.SEGUNDO_BACHILLERATO] },
    { value: NivelCurso.TERCERO_BACHILLERATO, label: NIVEL_DISPLAY_MAP[NivelCurso.TERCERO_BACHILLERATO] },
  ];

  const getEspecialidadesDisponibles = () => {
    if (!formData.nivel) return [];
    
    const esBasica = isBasicaCurso(formData.nivel);
    
    if (esBasica) {
      return [{ value: EspecialidadCurso.BASICA, label: 'Educación Básica' }];
    } else {
      return [
        { value: EspecialidadCurso.TECNICO, label: 'Técnico' },
        { value: EspecialidadCurso.CIENCIAS, label: 'Ciencias' },
      ];
    }
  };

  const getDocentesDisponibles = () => {
    if (!formData.nivel) return [];
    
    const esBasica = isBasicaCurso(formData.nivel);
    
    return docentes.filter(docente => {
      if (esBasica && docente.nivelAsignado === 'BASICA') return true;
      if (!esBasica && docente.nivelAsignado === 'BACHILLERATO') return true;
      return false;
    });
  };

  const handleNivelChange = (nivel: NivelCurso) => {
    const esBasica = isBasicaCurso(nivel);
    
    setFormData({ 
      nivel,
      especialidad: esBasica ? EspecialidadCurso.BASICA : '' as EspecialidadCurso,
      paralelo: 'A',
      docente_id: 'none',
    });
  };

  const handleSubmit = async () => {
    if (!periodoActivo?.id) {
      toast.error('No hay un período activo disponible');
      return;
    }

    if (!formData.nivel || !formData.especialidad || !formData.paralelo.trim()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    
    try {
      const cursoData: any = {
        nivel: formData.nivel,
        paralelo: formData.paralelo.toUpperCase().trim(),
        especialidad: formData.especialidad,
        periodo_lectivo_id: periodoActivo.id,
      };

      // Solo agregar docente_id si tiene un valor válido (no 'none')
      if (formData.docente_id !== 'none') {
        cursoData.docente_id = formData.docente_id;
      }

      await crearCurso(cursoData);
      
      onSuccess();
      handleReset();
      onClose();
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nivel: '' as NivelCurso,
      paralelo: 'A',
      especialidad: '' as EspecialidadCurso,
      docente_id: 'none', // 🔥 CAMBIO
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canSubmit = 
    formData.nivel && 
    formData.especialidad && 
    formData.paralelo.trim() && 
    periodoActivo?.id && 
    !loadingPeriodo;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto [&>button]:cursor-pointer">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Crear Nuevo Curso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          
          {/* Alerta de Período */}
          {loadingPeriodo ? (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Cargando período activo...</AlertDescription>
            </Alert>
          ) : errorPeriodo ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {errorPeriodo}
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={cargarPeriodoActivo}
                  className="ml-2"
                >
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : periodoActivo ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Período Activo:</strong> {periodoActivo.nombre}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-4">
            
            {/* Nivel Educativo */}
            <div className="space-y-2">
              <Label>Nivel Educativo *</Label>
              <Select 
                value={formData.nivel} 
                onValueChange={handleNivelChange}
                disabled={!periodoActivo}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecciona el nivel" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">EDUCACIÓN BÁSICA</div>
                  {nivelesBasicos.map((nivel) => (
                    <SelectItem key={nivel.value} value={nivel.value} className="cursor-pointer">{nivel.label}</SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 mt-2">BACHILLERATO</div>
                  {nivelesBachillerato.map((nivel) => (
                    <SelectItem key={nivel.value} value={nivel.value} className="cursor-pointer">{nivel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label>Especialidad *</Label>
              <Select
                value={formData.especialidad}
                onValueChange={(value) => setFormData({ ...formData, especialidad: value as EspecialidadCurso })}
                disabled={!formData.nivel || !periodoActivo}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecciona la especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {getEspecialidadesDisponibles().map((esp) => (
                    <SelectItem key={esp.value} value={esp.value} className="cursor-pointer">{esp.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paralelo */}
            <div className="space-y-2">
              <Label htmlFor="paralelo">Paralelo *</Label>
              <Input
                id="paralelo"
                value={formData.paralelo}
                onChange={(e) => setFormData({ ...formData, paralelo: e.target.value.toUpperCase() })}
                placeholder="A"
                maxLength={2}
                className="text-center text-xl font-bold"
                disabled={!periodoActivo}
              />
            </div>

            {/* TUTOR DEL CURSO */}
            <div className="space-y-2">
              <Label htmlFor="docente_id" className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-gray-500" />
                Tutor del Curso (Opcional)
              </Label>
              <Select
                value={formData.docente_id}
                onValueChange={(value) => setFormData({ ...formData, docente_id: value })}
                disabled={!formData.nivel || !periodoActivo || loadingDocentes}
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
                  <SelectItem value="none">Sin tutor asignado</SelectItem>
                  {getDocentesDisponibles().map((docente) => (
                    <SelectItem key={docente.id} value={docente.id} className="cursor-pointer">
                      {docente.nombres} {docente.apellidos} ({docente.nivelAsignado})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Solo se muestran docentes activos y compatibles con el nivel seleccionado
              </p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Los paralelos deben crearse en orden consecutivo (A, B, C...). El tutor puede asignarse ahora o posteriormente.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 cursor-pointer"
            disabled={loading}
            >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Curso'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}