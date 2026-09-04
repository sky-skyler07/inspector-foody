'use client';

import { cn } from '@/lib/utils';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';

interface UploadBoxProps {
  onFileSelected: (file: File, dataUrl: string) => void;
  className?: string;
}

export function UploadBox({ onFileSelected, className }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndProcess = useCallback(
    (file: File) => {
      const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!accepted.includes(file.type)) {
        setError('Please upload a JPG, PNG, or WebP image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be under 10 MB.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        onFileSelected(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndProcess(file);
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50'
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">
            Drag and drop a product image
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse from your device
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, or WebP · Max 10 MB
        </p>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
          <X className="h-4 w-4" />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) validateAndProcess(file);
        }}
      />
    </div>
  );
}
