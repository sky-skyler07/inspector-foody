'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { ComplianceScore } from '@/components/shared/compliance-score';
import { LoadingState, ErrorState } from '@/components/shared/states';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProduct } from '@/lib/mock-api';
import type { Product } from '@/lib/types';
import {
  ArrowLeft,
  ScanLine,
  Barcode,
  Building2,
  Globe2,
  Package,
  IndianRupee,
  Tag,
  Factory,
} from 'lucide-react';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getProduct(params.id)
      .then(setProduct)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <LoadingState message="Loading product details…" />
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ErrorState
          title="Product not found"
          message="The product you're looking for doesn't exist or has been removed."
          className="flex-1"
        />
      </div>
    );

  const info = [
    { icon: Barcode, label: 'Barcode', value: product.barcode, mono: true },
    { icon: Package, label: 'Quantity', value: product.quantity },
    { icon: IndianRupee, label: 'MRP', value: product.mrp },
    { icon: Factory, label: 'Manufacturer', value: product.manufacturer },
    { icon: Globe2, label: 'Country of Origin', value: product.countryOfOrigin },
    { icon: Tag, label: 'Category', value: product.category },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="mb-4 gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">{product.brand}</span>
                  <StatusBadge status={product.complianceStatus} size="md" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                {product.lastInspected && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Last inspected:{' '}
                    {new Date(product.lastInspected).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Compliance score */}
              <Card>
                <CardContent className="flex items-center gap-6 p-6">
                  <ComplianceScore score={product.complianceScore} size="md" showLabel={false} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                    <p className="text-lg font-semibold text-foreground">
                      {product.complianceScore >= 75
                        ? 'Compliant'
                        : product.complianceScore >= 50
                          ? 'Needs Attention'
                          : 'Non-Compliant'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on mandatory declaration checks
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Product info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {info.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p
                          className={`text-sm font-medium text-foreground ${item.mono ? 'font-mono' : ''}`}
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* CTA */}
              <Link href={`/scan?productId=${product.id}`}>
                <Button size="lg" className="w-full gap-2">
                  <ScanLine className="h-5 w-5" />
                  Run Inspection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
