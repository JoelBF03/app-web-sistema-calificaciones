'use client';

import { Check } from 'lucide-react';

interface Step {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
}

interface WizardProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
  steps: Step[];
}

export default function WizardProgressBar({ currentStep, steps }: WizardProgressBarProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 border-2
                    ${isCompleted ? 'bg-green-600 border-green-600 text-white' : ''}
                    ${isCurrent ? 'bg-blue-600 border-blue-600 text-white scale-110' : ''}
                    ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                </div>
                
                {/* Step Label */}
                <div className="absolute top-12 text-center min-w-[120px]">
                  <p
                    className={`
                      text-xs font-medium
                      ${isCurrent ? 'text-blue-700' : ''}
                      ${isCompleted ? 'text-green-700' : ''}
                      ${isUpcoming ? 'text-gray-400' : ''}
                    `}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 transition-all duration-300
                    ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}