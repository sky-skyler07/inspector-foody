'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Evidence } from '@/lib/types';

interface EvidenceViewerProps {
  evidence: Evidence;
  title?: string;
  className?: string;
}

export function EvidenceViewer({ evidence, title, className }: EvidenceViewerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && <h4 className="text-sm font-semibold text-foreground">{title}</h4>}
      <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted">
        <div className="relative aspect-[4/3]">
          <Image
            src={evidence.imageUrl}
            alt={evidence.label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          {/* Highlighted region overlay — consumes backend coordinates */}
          <div
            className="absolute border-2 border-destructive bg-destructive/15 rounded-md transition-all duration-300"
            style={{
              left: `${evidence.region.x}%`,
              top: `${evidence.region.y}%`,
              width: `${evidence.region.width}%`,
              height: `${evidence.region.height}%`,
            }}
          >
            <span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
              {evidence.label}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Highlighted region shows the detected area of non-compliance. Coordinates are
        normalized (x, y, width, height as percentages) and can be replaced with backend
        detection output.
      </p>
    </div>
  );
}
