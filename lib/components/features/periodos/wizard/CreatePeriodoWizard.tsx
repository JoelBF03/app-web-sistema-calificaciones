// nextjs-frontend/lib/components/features/periodos/wizard/CreatePeriodoWizard.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/lib/components/ui/dialog';
import { VisuallyHidden } from '@/lib/components/ui/visually-hidden';
import { toast } from 'sonner';
import { periodosService, trimestresService } from '@/lib/services/periodos';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import WizardProgressBar from './WizardProgressBar';
import Step1PeriodoInfo from './Step1PeriodoInfo';
import Step2TrimestresConfig from './Step2TrimestresConfig';
import Step3TiposEvaluacion from './Step3TiposEvaluacion';
import Step4Preview from './Step4Preview';
import { LayoutGrid } from 'lucide-react';

interface CreatePeriodoWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WizardState {
  currentStep: 1 | 2 | 3 | 4;
  periodoData: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
  };
  trimestresData: {
    trimestre1: { fechaInicio: string; fechaFin: string };
    trimestre2: { fechaInicio: string; fechaFin: string };
    trimestre3: { fechaInicio: string; fechaFin: string };
    modificados: boolean;
  };
  tiposEvaluacionData: {
    insumos: number;
    proyecto: number;
    examen: number;
  };
}

const INITIAL_STATE: WizardState = {
  currentStep: 1,
  periodoData: {
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
  },
  trimestresData: {
    trimestre1: { fechaInicio: '', fechaFin: '' },
    trimestre2: { fechaInicio: '', fechaFin: '' },
    trimestre3: { fechaInicio: '', fechaFin: '' },
    modificados: false,
  },
  tiposEvaluacionData: {
    insumos: 40,
    proyecto: 20,
    examen: 40,
  },
};

const WIZARD_STEPS = [
  { number: 1 as const, title: 'Período', description: 'Información básica' },
  { number: 2 as const, title: 'Trimestres', description: 'Configuración de fechas' },
  { number: 3 as const, title: 'Evaluación', description: 'Porcentajes' },
  { number: 4 as const, title: 'Confirmar', description: 'Revisar y crear' },
];

export default function CreatePeriodoWizard({ isOpen, onClose, onSuccess }: CreatePeriodoWizardProps) {
  const [wizardState, setWizardState] = useState<WizardState>(INITIAL_STATE);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    if (isCreating) return;
    setWizardState(INITIAL_STATE);
    onClose();
  };

  const handleStep1Next = (data: typeof INITIAL_STATE.periodoData) => {
    setWizardState({
      ...wizardState,
      periodoData: data,
      currentStep: 2,
    });
  };

  const handleStep2Next = (data: typeof INITIAL_STATE.trimestresData) => {
    setWizardState({
      ...wizardState,
      trimestresData: data,
      currentStep: 3,
    });
  };

  const handleStep3Next = (data: typeof INITIAL_STATE.tiposEvaluacionData) => {
    setWizardState({
      ...wizardState,
      tiposEvaluacionData: data,
      currentStep: 4,
    });
  };

  const handleBack = () => {
    if (wizardState.currentStep > 1) {
      setWizardState({
        ...wizardState,
        currentStep: (wizardState.currentStep - 1) as 1 | 2 | 3 | 4,
      });
    }
  };

  const handleConfirm = async () => {
    setIsCreating(true);

    try {
      // 1️⃣ Crear período lectivo (crea automáticamente 3 trimestres)
      const periodoResponse = await periodosService.create({
        nombre: wizardState.periodoData.nombre,
        fechaInicio: wizardState.periodoData.fechaInicio,
        fechaFin: wizardState.periodoData.fechaFin,
      });

      const periodoId = periodoResponse.periodo.id;
      const trimestresCreados = periodoResponse.trimestres;

      toast.success(`${periodoResponse.message}`);

      // 2️⃣ Actualizar fechas de trimestres (SOLO si fueron modificados)
      if (wizardState.trimestresData.modificados) {
        const trimestresMap = [
          { id: trimestresCreados[0].id, data: wizardState.trimestresData.trimestre1 },
          { id: trimestresCreados[1].id, data: wizardState.trimestresData.trimestre2 },
          { id: trimestresCreados[2].id, data: wizardState.trimestresData.trimestre3 },
        ];

        await Promise.all(
          trimestresMap.map((trimestre) =>
            trimestresService.update(trimestre.id, {
              fechaInicio: trimestre.data.fechaInicio,
              fechaFin: trimestre.data.fechaFin,
            })
          )
        );

        toast.success('Fechas de trimestres personalizadas aplicadas');
      }

      // 3️⃣ Crear tipos de evaluación
      await tiposEvaluacionService.createBatch(periodoId, {
        insumos: wizardState.tiposEvaluacionData.insumos,
        proyecto: wizardState.tiposEvaluacionData.proyecto,
        examen: wizardState.tiposEvaluacionData.examen,
      });

      toast.success('Tipos de evaluación configurados correctamente');

      // 🎉 Éxito total
      toast.success('Período lectivo creado completamente', {
        duration: 5000,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error al crear período:', error);
      toast.error(error.response?.data?.message || 'Error al crear el período lectivo', {
        duration: 7000,
      });
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-screen-xl w-[95vw] lg:w-[85vw] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-2xl">

        {/* Header con gradiente y padding adaptable */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-3 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black flex items-center gap-2 uppercase tracking-tight">
              <LayoutGrid className="h-5 w-5" />
              Configuración de Período Lectivo
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Contenedor con scroll interno solo si es necesario (para móviles) */}
        <div className="px-4 sm:px-12 pt-4 pb-6 overflow-y-auto max-h-[85vh]">

          <div className="mb-8">
            <WizardProgressBar currentStep={wizardState.currentStep} steps={WIZARD_STEPS} />
          </div>

          <div className="min-h-[300px]">
            {wizardState.currentStep === 1 && (
              <Step1PeriodoInfo
                initialData={wizardState.periodoData}
                onNext={handleStep1Next}
                onCancel={handleClose}
              />
            )}

            {wizardState.currentStep === 2 && (
              <Step2TrimestresConfig
                periodoFechaInicio={wizardState.periodoData.fechaInicio}
                periodoFechaFin={wizardState.periodoData.fechaFin}
                initialData={wizardState.trimestresData}
                onNext={handleStep2Next}
                onBack={handleBack}
              />
            )}

            {wizardState.currentStep === 3 && (
              <Step3TiposEvaluacion
                initialData={wizardState.tiposEvaluacionData}
                onNext={handleStep3Next}
                onBack={handleBack}
              />
            )}

            {wizardState.currentStep === 4 && (
              <Step4Preview
                periodoData={wizardState.periodoData}
                trimestresData={wizardState.trimestresData}
                tiposEvaluacionData={wizardState.tiposEvaluacionData}
                onBack={handleBack}
                onConfirm={handleConfirm}
                isCreating={isCreating}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}