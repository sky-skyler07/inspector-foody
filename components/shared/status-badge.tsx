'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { ComplianceStatus, CheckStatus, Severity } from '@/lib/types';

interface StatusBadgeProps {
  status: ComplianceStatus | CheckStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const config = {
  PASS: {
    label: 'Pass',
    className: 'bg-success/10 text-success border-success/30',
    Icon: CheckCircle2,
  },
  passed: {
    label: 'Passed',
    className: 'bg-success/10 text-success border-success/30',
    Icon: CheckCircle2,
  },
  WARNING: {
    label: 'Warning',
    className: 'bg-warning/10 text-warning border-warning/30',
    Icon: AlertTriangle,
  },
  warning: {
    label: 'Warning',
    className: 'bg-warning/10 text-warning border-warning/30',
    Icon: AlertTriangle,
  },
  FAIL: {
    label: 'Fail',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    Icon: XCircle,
  },
  failed: {
    label: 'Failed',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
    Icon: XCircle,
  },
};

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        c.className,
        size === 'md' && 'px-3 py-1 text-sm',
        className
      )}
    >
      <c.Icon className={size === 'md' ? 'h-4 w-4' : 'h-3 w-3'} />
      {c.label}
    </span>
  );
}

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig = {
  critical: 'bg-destructive text-destructive-foreground',
  major: 'bg-destructive/15 text-destructive border border-destructive/30',
  minor: 'bg-warning/15 text-warning border border-warning/30',
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        severityConfig[severity],
        className
      )}
    >
      {severity}
    </span>
  );
}

interface ReviewBadgeProps {
  status: 'pending' | 'reviewed' | 'flagged';
  className?: string;
}

const reviewConfig = {
  pending: 'bg-muted text-muted-foreground',
  reviewed: 'bg-success/10 text-success',
  flagged: 'bg-destructive/10 text-destructive',
};

export function ReviewBadge({ status, className }: ReviewBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        reviewConfig[status],
        className
      )}
    >
      {status}
    </span>
  );
}
