'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent } from '@/components/ui/card';
import {
  ScanLine,
  FileSearch,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Eye,
  Package,
  Building2,
  Globe2,
  Phone,
  Calendar,
  Hash,
} from 'lucide-react';

const steps = [
  {
    icon: ScanLine,
    title: 'Scan',
    description:
      'Use your camera or upload an image of the product packaging. The system accepts JPG, PNG, and WebP files up to 10 MB.',
  },
  {
    icon: FileSearch,
    title: 'Extract',
    description:
      'OCR (Optical Character Recognition) reads the text on the packaging label. The system then parses out individual declarations like MRP, net quantity, manufacturer, and dates.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify',
    description:
      'Each extracted declaration is checked against mandatory compliance rules. The rule engine validates presence, legibility, format, and required markings.',
  },
  {
    icon: FileText,
    title: 'Report',
    description:
      'A compliance report is generated with an overall score, individual check results, violation evidence with highlighted regions, and a printable summary.',
  },
];

const checkCategories = [
  { icon: CheckCircle2, label: 'MRP', description: 'Maximum Retail Price presence and format' },
  { icon: Package, label: 'Net Quantity', description: 'Declared weight or volume' },
  { icon: Building2, label: 'Manufacturer', description: 'Manufacturer or packer name and address' },
  { icon: Globe2, label: 'Country of Origin', description: 'Clear country of origin declaration' },
  { icon: Phone, label: 'Consumer Care', description: 'Consumer care contact details' },
  { icon: Calendar, label: 'Date Declaration', description: 'Best before or expiry date' },
  { icon: Hash, label: 'Batch / Lot', description: 'Batch or lot number for traceability' },
  { icon: Shield, label: 'Required Markings', description: 'FSSAI or standard certification marks' },
  { icon: Eye, label: 'Readability', description: 'Font size and label legibility' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-primary/5 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <ShieldCheck className="h-4 w-4" />
              How It Works
            </div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              AI-Assisted Compliance Inspection
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Inspector Foody combines optical character recognition with a rule-based
              compliance engine to verify that packaged food products meet mandatory
              labelling standards.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <Card key={step.title} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-2xl font-bold text-muted/40 tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Check categories */}
        <section className="py-16 border-b border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-foreground">What We Check</h2>
              <p className="mt-2 text-muted-foreground">
                Nine categories of mandatory declarations are validated on every scan
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {checkCategories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Status legend */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground">Compliance Outcomes</h2>
            </div>
            <div className="space-y-4">
              <Card className="border-success/20 bg-success/5">
                <CardContent className="p-5 flex items-start gap-4">
                  <CheckCircle2 className="h-7 w-7 text-success shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Pass — Score 75% and above</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      All mandatory declarations are present, legible, and compliant.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="p-5 flex items-start gap-4">
                  <AlertTriangle className="h-7 w-7 text-warning shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Warning — Score 50% to 74%</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Declarations are present but have readability or placement issues.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-5 flex items-start gap-4">
                  <XCircle className="h-7 w-7 text-destructive shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Fail — Score below 50%</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mandatory declarations are missing, illegible, or non-compliant.
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
