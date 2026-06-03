import React from 'react';
import { CalendarDays, FileText, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { BookingStep } from '../lib/types';

interface StepIndicatorProps {
  currentStep: BookingStep;
}

const steps: { id: BookingStep; label: string; icon: React.ElementType }[] = [
  { id: 'booking', label: 'reservations.steps.booking', icon: CalendarDays },
  { id: 'details', label: 'reservations.steps.details', icon: FileText },
  { id: 'confirmation', label: 'reservations.steps.confirmation', icon: Check },
];

export default function ReservationSteps({ currentStep }: StepIndicatorProps) {
  const { t } = useTranslation();
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div
              key={step.id}
              className={`flex flex-col items-center space-y-2 ${
                isActive ? 'text-sf-gold' : isCompleted ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-sf-gold text-sf-black'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{t(step.label)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}