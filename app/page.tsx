'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { SearchBar } from '@/components/shared/search-bar';
import { ProductCard } from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ScanLine,
  FileSearch,
  ShieldCheck,
  FileText,
  ArrowRight,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getFeaturedProducts } from '@/lib/mock-api';
import type { Product } from '@/lib/types';

const steps = [
  {
    icon: ScanLine,
    title: 'Scan',
    description: 'Capture or upload a product image using your camera or device.',
  },
  {
    icon: FileSearch,
    title: 'Extract',
    description: 'OCR reads the packaging label and extracts all declared information.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify',
    description: 'Each declaration is checked against mandatory compliance rules.',
  },
  {
    icon: FileText,
    title: 'Report',
    description: 'Generate a detailed compliance report with evidence and scores.',
  },
];

const stats = [
  { label: 'Sample Products', value: '500+', tag: 'Prototype Dataset' },
  { label: 'Simulated Checks', value: '3,000+', tag: 'Demo Checks' },
  { label: 'Compliance Rules', value: '20+', tag: 'Detection Categories' },
  { label: 'Processing Time', value: '~4 sec', tag: 'Prototype Processing' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
<section className="relative overflow-hidden border-b border-border">
  {/* Hero background image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: 'url("/products/hero-img.jpeg")' }}
  />

  {/* Light overlay for readability */}
  <div className="absolute inset-0 bg-background/55" />

  {/* Subtle bottom gradient */}
  <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/80" />

  {/* Hero content */}
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
        <ShieldCheck className="h-4 w-4" />
        Packaged Commodity Compliance Inspection
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
        Scan. Inspect. Verify.
      </h1>

      <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
        Inspector Foody helps you verify that packaged food products meet
        mandatory labelling and compliance standards — from MRP and net quantity
        to manufacturer details and required markings.
      </p>

      <div className="mt-8 max-w-2xl mx-auto">
        <SearchBar autoFocus />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/scan">
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <ScanLine className="h-5 w-5" />
            Scan Product
          </Button>
        </Link>

        <Link href="/search">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto gap-2"
          >
            <Package className="h-5 w-5" />
            Search Products
          </Button>
        </Link>
      </div>
    </div>
  </div>
</section>

        {/* How It Works */}
        <section className="border-b border-border py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">How Inspector Foody Works</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Four steps from product scan to compliance report.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <Card key={step.title} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-3xl font-bold text-muted/50 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="border-b border-border py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Recent Products</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recently inspected products in the database
                </p>
              </div>
              <Link href="/search">
                <Button variant="outline" size="sm" className="gap-1.5">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                Prototype Data
              </span>
            </div>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">
                    {stat.tag}
                  </p>
                  <p className="mt-1 text-3xl font-bold lg:text-4xl tabular-nums">{stat.value}</p>
                  <p className="mt-1 text-sm text-primary-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance legend */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground">Compliance Status Legend</h2>
              <p className="mt-2 text-muted-foreground">
                Every product receives one of three compliance outcomes
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border-success/20 bg-success/5">
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle2 className="h-8 w-8 text-success shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Pass</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      All mandatory declarations are present, legible, and compliant with
                      regulatory standards.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-warning shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Warning</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Declarations are present but have readability, font size, or placement
                      issues that need attention.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-6 flex items-start gap-4">
                  <XCircle className="h-8 w-8 text-destructive shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Fail</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      One or more mandatory declarations are missing, illegible, or
                      non-compliant with regulatory requirements.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
