'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { Barcode, Package } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <StatusBadge status={product.complianceStatus} />
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
            <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            <span>{product.quantity}</span>
            <span className="text-border">·</span>
            <span>{product.category}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Barcode className="h-3.5 w-3.5" />
            <span>{product.barcode}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-foreground">{product.mrp}</span>
            <span className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Score</span>
              <span
                className={
                  product.complianceScore >= 75
                    ? 'text-sm font-bold text-success'
                    : product.complianceScore >= 50
                      ? 'text-sm font-bold text-warning'
                      : 'text-sm font-bold text-destructive'
                }
              >
                {product.complianceScore}%
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
