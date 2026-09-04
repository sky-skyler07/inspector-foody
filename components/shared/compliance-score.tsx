'use client';

import { cn } from '@/lib/utils';

interface ComplianceScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeConfig = {
  sm: { ring: 80, stroke: 6, text: 'text-lg' },
  md: { ring: 120, stroke: 8, text: 'text-2xl' },
  lg: { ring: 160, stroke: 10, text: 'text-4xl' },
};

export function ComplianceScore({ score, size = 'md', showLabel = true }: ComplianceScoreProps) {
  const s = sizeConfig[size];
  const radius = (s.ring - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? 'hsl(var(--success))' : score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: s.ring, height: s.ring }}>
        <svg className="-rotate-90" width={s.ring} height={s.ring}>
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={s.stroke}
          />
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold tabular-nums', s.text)} style={{ color }}>
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">Compliance Score</span>
      )}
    </div>
  );
}
