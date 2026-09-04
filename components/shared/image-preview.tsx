'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove?: () => void;
  className?: string;
  aspect?: 'square' | 'video' | 'auto';
}

const aspectClass = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: '',
};

export function ImagePreview({
  src,
  alt = 'Product image',
  onRemove,
  className,
  aspect = 'square',
}: ImagePreviewProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-muted',
        aspectClass[aspect],
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 shadow-sm text-foreground hover:bg-background transition-colors"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
