'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from './status-badge';
import { AlertCircle, Eye, Check } from 'lucide-react';
import type { Violation } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ViolationCardProps {
  violation: Violation;
  onViewEvidence?: (violation: Violation) => void;
  onMarkReviewed?: (violationId: string) => void;
}

const severityBorder = {
  critical: 'border-destructive/30 bg-destructive/5',
  major: 'border-destructive/20 bg-destructive/5',
  minor: 'border-warning/30 bg-warning/5',
};

export function ViolationCard({
  violation,
  onViewEvidence,
  onMarkReviewed,
}: ViolationCardProps) {
  return (
    <Card className={cn('border-2', severityBorder[violation.severity])}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <CardTitle className="text-base">{violation.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rule: {violation.ruleReference}
            </p>
          </div>
          </div>
          <SeverityBadge severity={violation.severity} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{violation.explanation}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Confidence</span>
            <span className="font-semibold text-foreground tabular-nums">
              {violation.confidence}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {violation.reviewed ? (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <Check className="h-3.5 w-3.5" /> Reviewed
              </span>
            ) : (
              onMarkReviewed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onMarkReviewed(violation.id)}
                >
                  Mark as reviewed
                </Button>
              )
            )}
            {onViewEvidence && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => onViewEvidence(violation)}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                View Evidence
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
