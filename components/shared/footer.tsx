'use client';
import Link from 'next/link';
import { ShieldCheck, ScanLine, FileText, Info } from 'lucide-react';
import Image from 'next/image';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { href: '/search', label: 'Search Products' },
      { href: '/scan', label: 'Scan Product' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/about', label: 'How It Works' },
      { href: '/inspections', label: 'Inspections' },
      { href: '/reports', label: 'Reports' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/login', label: 'Sign In' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Image
  src="/products/foody-logo/logo.jpeg"
  alt="Inspector Foody Logo"
  width={300}
  height={150}
  className="h-[150px] w-[300px] object-contain"
/>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              AI-assisted packaged-commodity compliance inspection for food products.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Scan. Inspect. Verify.</span>
            </div>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Inspector Foody. Prototype build with mock data.
          </p>
          <p className="text-xs text-muted-foreground">
            Inspired by open food data principles · Not affiliated with any existing product database.
          </p>
        </div>
      </div>
    </footer>
  );
}
