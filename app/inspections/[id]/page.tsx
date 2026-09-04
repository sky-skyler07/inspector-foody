'use client';

import { AppShell } from '@/components/shared/app-shell';
import { ComplianceScore } from '@/components/shared/compliance-score';
import { StatusBadge } from '@/components/shared/status-badge';
import { CheckItem } from '@/components/shared/check-item';
import { ViolationCard } from '@/components/shared/violation-card';
import { EvidenceViewer } from '@/components/shared/evidence-viewer';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getInspection, markViolationReviewed, generateReport } from '@/lib/mock-api';
import type { Inspection, Violation } from '@/lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Plus,
  ArrowLeft,
  Eye,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ComplianceResultPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [evidenceViolation, setEvidenceViolation] = useState<Violation | null>(null);

  useEffect(() => {
    getInspection(params.id)
      .then(setInspection)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleMarkReviewed = async (violationId: string) => {
    if (!inspection) return;
    await markViolationReviewed(inspection.id, violationId);
    setInspection({
      ...inspection,
      violations: inspection.violations.map((v) =>
        v.id === violationId ? { ...v, reviewed: true } : v
      ),
    });
    toast.success('Violation marked as reviewed');
  };

  const handleGenerateReport = async () => {
    if (!inspection) return;
    toast.success('Report generated successfully');
    router.push(`/inspections/${inspection.id}/report`);
  };

  if (loading)
    return (
      <AppShell>
        <LoadingState message="Loading compliance results…" />
      </AppShell>
    );

  if (error || !inspection)
    return (
      <AppShell>
        <ErrorState
          title="Inspection not found"
          message="The inspection results could not be loaded."
          onRetry={() => router.push('/scan')}
        />
      </AppShell>
    );

  const passed = inspection.checks.filter((c) => c.status === 'passed');
  const warnings = inspection.checks.filter((c) => c.status === 'warning');
  const failed = inspection.checks.filter((c) => c.status === 'failed');

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <Link href="/scan">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Scan
          </Button>
        </Link>

        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] mb-8">
          <div className="relative h-40 w-40 rounded-2xl overflow-hidden border border-border bg-muted shrink-0 mx-auto lg:mx-0">
            <Image
              src={inspection.imageUrl}
              alt={inspection.product.name}
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={inspection.complianceStatus} size="md" />
              <span className="text-xs text-muted-foreground font-mono">{inspection.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{inspection.product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {inspection.product.brand} · {inspection.product.barcode}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Inspected by {inspection.inspector} on{' '}
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

        {/* Score + Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="lg:col-span-1 flex items-center justify-center">
            <CardContent className="p-6">
              <ComplianceScore score={inspection.complianceScore} size="md" />
            </CardContent>
          </Card>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-5 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success shrink-0" />
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{passed.length}</p>
                <p className="text-sm text-muted-foreground">Passed Checks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-5 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning shrink-0" />
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{warnings.length}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-5 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive shrink-0" />
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{failed.length}</p>
                <p className="text-sm text-muted-foreground">Failed Checks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Button size="lg" className="flex-1 gap-2" onClick={handleGenerateReport}>
            <FileText className="h-5 w-5" />
            Generate Report
          </Button>
          <Link href="/scan" className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Plus className="h-5 w-5" />
              Start New Inspection
            </Button>
          </Link>
        </div>

        {/* Tabs: Checks / Violations / Evidence */}
        <Tabs defaultValue="checks">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="checks" className="gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Compliance Checks
            </TabsTrigger>
            <TabsTrigger value="violations" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Violations ({inspection.violations.length})
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Summary
            </TabsTrigger>
          </TabsList>

          {/* Checks tab */}
          <TabsContent value="checks" className="space-y-2">
            {inspection.checks.map((check) => (
              <CheckItem
                key={check.id}
                check={check}
                expanded={expandedCheck === check.id}
                onClick={() =>
                  setExpandedCheck(expandedCheck === check.id ? null : check.id)
                }
              />
            ))}
          </TabsContent>

          {/* Violations tab */}
          <TabsContent value="violations">
            {inspection.violations.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No violations detected"
                description="All mandatory declarations passed compliance checks."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {inspection.violations.map((v) => (
                  <ViolationCard
                    key={v.id}
                    violation={v}
                    onViewEvidence={(violation) => setEvidenceViolation(violation)}
                    onMarkReviewed={handleMarkReviewed}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Summary tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mandatory Declaration Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {inspection.checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between gap-3 border-b border-border last:border-0 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      {check.status === 'passed' ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      ) : check.status === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{check.label}</p>
                        <p className="text-xs text-muted-foreground">{check.ruleReference}</p>
                      </div>
                    </div>
                    <StatusBadge status={check.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Evidence Dialog */}
      <Dialog
        open={!!evidenceViolation}
        onOpenChange={(open) => !open && setEvidenceViolation(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Violation Evidence
            </DialogTitle>
            <DialogDescription>
              {evidenceViolation?.title} — {evidenceViolation?.ruleReference}
            </DialogDescription>
          </DialogHeader>
          {evidenceViolation && (
            <div className="space-y-4">
              <EvidenceViewer
                evidence={evidenceViolation.evidence[0]}
                title="Detected Region"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <p className="font-semibold text-foreground capitalize">
                    {evidenceViolation.severity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold text-foreground tabular-nums">
                    {evidenceViolation.confidence}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Explanation</p>
                <p className="text-sm text-foreground">{evidenceViolation.explanation}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {!evidenceViolation.reviewed && (
                  <Button
                    onClick={() => {
                      handleMarkReviewed(evidenceViolation.id);
                      setEvidenceViolation(null);
                    }}
                  >
                    Mark as Reviewed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
