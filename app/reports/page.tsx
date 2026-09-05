'use client';

import { AppShell } from '@/components/shared/app-shell';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState, EmptyState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, ArrowRight, FileSearch } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getInspections } from '@/lib/mock-api';
import type { Inspection } from '@/lib/types';

export default function ReportsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInspections()
      .then(setInspections)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generated mock data compliance inspection reports
          </p>
        </div>

        {loading ? (
          <LoadingState message="Loading reports…" />
        ) : inspections.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No reports yet"
            description="Run an inspection to generate your first compliance report."
            action={
              <Link href="/scan">
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Start Inspection
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inspections.map((ins) => (
              <Card key={ins.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <FileText className="h-8 w-8 text-primary" />
                    <StatusBadge status={ins.complianceStatus} />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{ins.id}</p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {ins.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{ins.product.brand}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Score:{' '}
                      <span
                        className={
                          ins.complianceScore >= 75
                            ? 'font-bold text-success'
                            : ins.complianceScore >= 50
                              ? 'font-bold text-warning'
                              : 'font-bold text-destructive'
                        }
                      >
                        {ins.complianceScore}%
                      </span>
                    </span>
                    <span>{new Date(ins.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link href={`/inspections/${ins.id}/report`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.print()}
                      className="gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
