import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Inspector Foody — Scan. Inspect. Verify.',
  description:
    'Inspector Foody is a food and product compliance inspection platform. Scan packaged products, verify mandatory declarations, and generate compliance reports.',
  openGraph: {
    title: 'Inspector Foody — Scan. Inspect. Verify.',
    description:
      'AI-assisted packaged-commodity compliance inspection for food products.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
