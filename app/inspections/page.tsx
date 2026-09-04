'use client';

import { AppShell } from '@/components/shared/app-shell';
import { InspectionTable } from '@/components/shared/inspection-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { LoadingState, EmptyState } from '@/components/shared/states';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getInspections } from '@/lib/mock-api';
import type { Inspection } from '@/lib/types';

export default function InspectionHistoryPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
    getInspections()
      .then(setInspections)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...inspections];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.product.name.toLowerCase().includes(q) ||
          i.product.brand.toLowerCase().includes(q) ||
          i.inspector.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.complianceStatus === statusFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'score-desc':
          return b.complianceScore - a.complianceScore;
        case 'score-asc':
          return a.complianceScore - b.complianceScore;
        default:
          return 0;
      }
    });
    return result;
  }, [inspections, search, statusFilter, sortBy]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspection History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and filter all compliance inspections
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, product, brand, or inspector…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-44">
                  <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PASS">Pass</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="FAIL">Fail</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="score-desc">Highest Score</SelectItem>
                  <SelectItem value="score-asc">Lowest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <LoadingState message="Loading inspections…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title="No inspections found"
            description="Try adjusting your search or filters to find inspections."
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {filtered.length} inspection{filtered.length !== 1 ? 's' : ''} found
            </p>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <InspectionTable inspections={filtered} />
            </div>
            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((ins) => (
                <Card key={ins.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium">{ins.id}</span>
                      <StatusBadge status={ins.complianceStatus} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ins.product.name}</p>
                      <p className="text-xs text-muted-foreground">{ins.product.brand}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Score:{' '}
                        <span
                          className={
                            ins.complianceScore >= 75
                              ? 'font-bold text-success'
                              : ins.complianceScore >= 50
                                ? 'font-bold text-warning'
                                : 'font-bold text-destructive'
                          }
                        >
                          {ins.complianceScore}%
                        </span>
                      </span>
                      <span>{new Date(ins.date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
