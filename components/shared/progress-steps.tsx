'use client';

import { cn } from '@/lib/utils';
import { Check, Loader2, Circle } from 'lucide-react';
import type { AnalysisStep } from '@/lib/types';

interface ProgressStepsProps {
  steps: AnalysisStep[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isPending = i > currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-start gap-3 rounded-lg p-3 transition-all',
              isActive && 'bg-primary/5 border border-primary/20',
              isDone && 'opacity-70'
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isDone ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="h-4 w-4" />
                </div>
              ) : isActive ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-muted text-muted-foreground">
                  <Circle className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isPending ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
