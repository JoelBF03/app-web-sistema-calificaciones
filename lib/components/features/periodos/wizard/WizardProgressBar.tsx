'use client';

import { Check } from 'lucide-react';

interface Step {
  number: 1 | 2 | 3 | 4;
  title: string;
}

interface WizardProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
  steps: Step[];
}

export default function WizardProgressBar({ currentStep, steps }: WizardProgressBarProps) {
  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center group relative">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all duration-500 shadow-sm border-2 z-10
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-white border-blue-600 text-blue-600 ring-2 ring-blue-100' : ''}
                  ${isUpcoming ? 'bg-gray-50 border-gray-200 text-gray-400' : ''}
                `}>
                  {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : step.number}
                </div>

                <div className="absolute -bottom-5 w-max text-center">
                  <p className={`text-[10px] font-black uppercase tracking-tighter ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 -translate-y-2.5">
                  <div className={`h-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}