'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { box: 'h-8 w-8', image: 'h-8 w-8', text: 'text-base' },
  md: {
    box: 'h-[60px] w-[60px]',
    image: 'h-[60px] w-[60px]',
    text: 'text-lg',
  },
  lg: {
    box: 'h-12 w-12',
    image: 'h-12 w-12',
    text: 'text-2xl',
  },
};

export function Logo({
  className,
  showTagline = false,
  size = 'md',
}: LogoProps) {
  const s = sizes[size];

  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2.5 group', className)}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-xl overflow-hidden',
          s.box
        )}
      >
        <Image
          src="/products/foody-logo/logo.jpeg"
          alt="Inspector Foody Logo"
          width={60}
          height={60}
          className={cn('object-contain', s.image)}
        />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-bold tracking-tight text-foreground',
            s.text
          )}
        >
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
        'flex items-center justify-center rounded-xl overflow-hidden',
        className
      )}
    >
      <Image
        src="/products/foody-logo/logo.jpeg"
        alt="Inspector Foody Logo"
        width={60}
        height={60}
        className="h-[60px] w-[60px] object-contain"
      />
    </div>
  );
}