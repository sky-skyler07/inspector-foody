'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ShieldCheck, ScanLine } from 'lucide-react';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { box: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-base' },
  md: { box: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-lg' },
  lg: { box: 'h-12 w-12', icon: 'h-6 w-6', text: 'text-2xl' },
};

export function Logo({ className, showTagline = false, size = 'md' }: LogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={cn('flex items-center gap-2.5 group', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105',
          s.box
        )}
      >
        <ShieldCheck className={s.icon} />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('font-bold tracking-tight text-foreground', s.text)}>
          Inspector Foody
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Scan. Inspect. Verify.
          </span>
        )}
      </div>
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-primary text-primary-foreground',
        className
      )}
    >
      <ShieldCheck className="h-5 w-5" />
    </div>
  );
}
