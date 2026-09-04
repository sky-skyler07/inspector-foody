'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { ComplianceCheck } from '@/lib/types';

interface CheckItemProps {
  check: ComplianceCheck;
  onClick?: () => void;
  expanded?: boolean;
}

const statusConfig = {
  passed: {
    Icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  warning: {
    Icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  failed: {
    Icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
  },
};

export function CheckItem({ check, onClick, expanded }: CheckItemProps) {
  const c = statusConfig[check.status];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3.5 transition-colors',
        c.border,
        onClick && 'cursor-pointer hover:bg-muted/50'
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', c.bg)}>
        <c.Icon className={cn('h-5 w-5', c.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{check.label}</p>
            <p className="text-xs text-muted-foreground">{check.category}</p>
          </div>
          <span className={cn('text-xs font-bold tabular-nums', c.color)}>
            {check.confidence}%
          </span>
        </div>
        {expanded && (
          <div className="mt-2 space-y-1.5 text-xs">
            <p className="text-muted-foreground">{check.message}</p>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Rule: {check.ruleReference}</span>
            </div>
            {check.expected && (
              <p className="text-muted-foreground">
                <span className="font-medium">Expected:</span> {check.expected}
              </p>
            )}
            {check.actual && (
              <p className="text-muted-foreground">
                <span className="font-medium">Detected:</span> {check.actual}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
