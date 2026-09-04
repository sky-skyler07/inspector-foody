'use client';

import { AppShell } from '@/components/shared/app-shell';
import { ProgressSteps } from '@/components/shared/progress-steps';
import { ErrorState } from '@/components/shared/states';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getAnalysisSteps, analyzeInspection } from '@/lib/mock-api';
import type { AnalysisStep, Inspection } from '@/lib/types';
import { ScanLine } from 'lucide-react';

function AnalyzingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inspectionId = searchParams.get('id') ?? '';
  const imgParam = searchParams.get('img');
  const imageData = imgParam
    ? decodeURIComponent(imgParam)
    : 'https://picsum.photos/seed/analyzing/400/400';

  const [steps] = useState<AnalysisStep[]>(getAnalysisSteps());
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;
    let cancelled = false;

    analyzeInspection(inspectionId, (stepIndex) => {
      if (!cancelled) setCurrentStep(stepIndex + 1);
    })
      .then((inspection: Inspection) => {
        if (!cancelled) {
          setTimeout(() => {
            router.push(`/inspections/${inspection.id}?fromAnalysis=1`);
          }, 500);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [inspectionId, router]);

  if (error) {
    return (
      <AppShell>
        <ErrorState
          title="Analysis Failed"
          message="The inspection could not be completed. Please try scanning the product again."
          onRetry={() => router.push('/scan')}
        />
      </AppShell>
    );
  }

  const progress = Math.round((currentStep / steps.length) * 100);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <ScanLine className="h-4 w-4 animate-pulse" />
            Analyzing Product
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Compliance Inspection in Progress
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inspector Foody is processing the product image. This usually takes a few seconds.
          </p>
        </div>

        {/* Product thumbnail + scan animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="relative h-40 w-40 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted">
              <Image
                src={imageData}
                alt="Product being analyzed"
                fill
                className="object-cover"
                sizes="160px"
              />
              {/* Scan line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-scan-line" />
              </div>
            </div>
            {/* Pulse ring */}
            <div className="absolute -inset-2 rounded-2xl border-2 border-primary/30 animate-pulse-ring" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-muted-foreground">Overall Progress</span>
            <span className="font-bold text-foreground tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <ProgressSteps steps={steps} currentStep={currentStep} />
      </div>
    </AppShell>
  );
}

export default function AnalyzingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AnalyzingContent />
    </Suspense>
  );
}
