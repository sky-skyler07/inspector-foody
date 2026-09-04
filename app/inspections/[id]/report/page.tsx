'use client';

import { AppShell } from '@/components/shared/app-shell';
import { Logo } from '@/components/shared/logo';
import { StatusBadge, ReviewBadge } from '@/components/shared/status-badge';
import { ComplianceScore } from '@/components/shared/compliance-score';
import { CheckItem } from '@/components/shared/check-item';
import { LoadingState, ErrorState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getInspection } from '@/lib/mock-api';
import type { Inspection } from '@/lib/types';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
} from 'lucide-react';

export default function ReportPage({ params }: { params: { id: string } }) {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getInspection(params.id)
      .then(setInspection)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return (
      <AppShell>
        <LoadingState message="Loading report…" />
      </AppShell>
    );

  if (error || !inspection)
    return (
      <AppShell>
        <ErrorState title="Report not found" onRetry={() => window.history.back()} />
      </AppShell>
    );

  const passed = inspection.checks.filter((c) => c.status === 'passed');
  const warnings = inspection.checks.filter((c) => c.status === 'warning');
  const failed = inspection.checks.filter((c) => c.status === 'failed');

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Action bar (no-print) */}
        <div className="flex items-center justify-between mb-6 no-print">
          <Link href={`/inspections/${inspection.id}`}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Inspection
            </Button>
          </Link>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
        </div>

        {/* Report document */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-8 lg:p-12">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border pb-6 mb-6">
              <div>
                <Logo size="lg" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Compliance Inspection Report
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Report ID</p>
                <p className="font-mono text-sm font-semibold text-foreground">{inspection.id}</p>
                <p className="mt-2 text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(inspection.date).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Product info */}
            <div className="grid gap-6 lg:grid-cols-[200px_1fr] mb-8">
              <div className="relative h-48 w-full rounded-xl overflow-hidden border border-border bg-muted">
                <Image
                  src={inspection.imageUrl}
                  alt={inspection.product.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">{inspection.product.name}</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <p className="font-medium text-foreground">{inspection.product.brand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Barcode</p>
                    <p className="font-mono font-medium text-foreground">{inspection.product.barcode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="font-medium text-foreground">{inspection.product.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">MRP</p>
                    <p className="font-medium text-foreground">{inspection.product.mrp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Manufacturer</p>
                    <p className="font-medium text-foreground">{inspection.product.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Country of Origin</p>
                    <p className="font-medium text-foreground">{inspection.product.countryOfOrigin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score + Status */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 border-y border-border py-6 mb-8">
              <ComplianceScore score={inspection.complianceScore} size="lg" />
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Overall Status</p>
                <StatusBadge status={inspection.complianceStatus} size="md" />
                <ReviewBadge status={inspection.reviewStatus} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{passed.length}</p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
                <div>
                  <AlertTriangle className="h-6 w-6 text-warning mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{warnings.length}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
                <div>
                  <XCircle className="h-6 w-6 text-destructive mx-auto mb-1" />
                  <p className="text-xl font-bold text-foreground">{failed.length}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>

            {/* Failed checks */}
            {failed.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  Failed Checks
                </h3>
                <div className="space-y-2">
                  {failed.map((c) => (
                    <CheckItem key={c.id} check={c} expanded />
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Warning Checks
                </h3>
                <div className="space-y-2">
                  {warnings.map((c) => (
                    <CheckItem key={c.id} check={c} expanded />
                  ))}
                </div>
              </div>
            )}

            {/* Passed checks */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                Passed Checks
              </h3>
              <div className="space-y-2">
                {passed.map((c) => (
                  <CheckItem key={c.id} check={c} expanded />
                ))}
              </div>
            </div>

            {/* Violations summary */}
            {inspection.violations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-base font-semibold text-foreground mb-3">
                  Violations Detected
                </h3>
                <div className="space-y-3">
                  {inspection.violations.map((v) => (
                    <div key={v.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground">{v.title}</p>
                        <span className="text-xs font-medium text-destructive capitalize">
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{v.explanation}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Rule: {v.ruleReference} · Confidence: {v.confidence}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Inspector + Signature */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Inspector</p>
                <p className="text-sm font-semibold text-foreground">{inspection.inspector}</p>
                <p className="text-xs text-muted-foreground">Senior Compliance Inspector</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-6">Signature</p>
                <div className="h-12 border-b border-border" />
                <p className="text-xs text-muted-foreground mt-1">
                  Digitally signed via Inspector Foody
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                This report was generated by Inspector Foody · Scan. Inspect. Verify.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Prototype build — all data is mock data for demonstration purposes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
