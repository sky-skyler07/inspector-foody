'use client';

import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { SearchBar } from '@/components/shared/search-bar';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState, LoadingState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, SearchX, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { searchProducts } from '@/lib/mock-api';
import type { Product, ComplianceStatus, SearchResult } from '@/lib/types';

const categories = [
  'all',
  'Honey & Spreads',
  'Dry Fruits',
  'Beverages',
  'Grains & Flours',
  'Oils & Ghee',
  'Confectionery',
  'Dairy',
  'Sauces & Condiments',
];

const statuses: (ComplianceStatus | 'all')[] = ['all', 'PASS', 'WARNING', 'FAIL'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<ComplianceStatus | 'all'>('all');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const doSearch = useCallback(
    async (q: string, p: number) => {
      setLoading(true);
      try {
        const res = await searchProducts(q, p, 6, {
          category: category === 'all' ? undefined : category,
          status: status === 'all' ? undefined : status,
        });
        setResult(res);
      } finally {
        setLoading(false);
      }
    },
    [category, status]
  );

  useEffect(() => {
    doSearch(query, page);
  }, [query, page, doSearch]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(1);
  };

  const products: Product[] = result?.products ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Search Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse the product database by name, brand, or barcode
            </p>
          </div>

          <div className="space-y-4">
            <SearchBar defaultValue={query} onSearch={handleSearch} autoFocus />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
                Filters:
              </div>
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === 'all' ? 'All Categories' : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as ComplianceStatus | 'all');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === 'all' ? 'All Statuses' : s === 'PASS' ? 'Pass' : s === 'WARNING' ? 'Warning' : 'Fail'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="mt-8">
            {loading ? (
              <LoadingState message="Searching products…" />
            ) : products.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No products found"
                description="Try adjusting your search query or filters to find what you're looking for."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('');
                      setCategory('all');
                      setStatus('all');
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {products.length} of {result?.total} products
                </p>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {result && page * result.pageSize < result.total && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      className="gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
