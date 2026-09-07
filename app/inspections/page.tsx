'use client';

import { AppShell } from '@/components/shared/app-shell';
import { InspectionTable } from '@/components/shared/inspection-table';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from '@/components/shared/states';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Card,
  CardContent,
} from '@/components/ui/card';

import {
  Search,
  Filter,
  History,
  RefreshCw,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getInspections } from '@/lib/api';

import type { Inspection } from '@/lib/types';

export default function InspectionHistoryPage() {

  const [inspections, setInspections] =
    useState<Inspection[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<string>('all');

  const [sortBy, setSortBy] =
    useState<string>('date-desc');

  const loadInspections = () => {

    setLoading(true);
    setError(false);

    getInspections()
      .then(setInspections)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInspections();
  }, []);

  const filtered = useMemo(() => {

    let result = [...inspections];

    if (search.trim()) {

      const q = search
        .toLowerCase()
        .trim();

      result = result.filter(
        (inspection) => {

          const productName =
            inspection.product?.name || '';

          const brand =
            inspection.product?.brand || '';

          const inspector =
            inspection.inspector || '';

          const id =
            inspection.id || '';

          return (
            id.toLowerCase().includes(q) ||
            productName
              .toLowerCase()
              .includes(q) ||
            brand
              .toLowerCase()
              .includes(q) ||
            inspector
              .toLowerCase()
              .includes(q)
          );
        }
      );
    }

    if (statusFilter !== 'all') {

      result = result.filter(
        (inspection) =>
          inspection.complianceStatus ===
          statusFilter
      );
    }

    result.sort((a, b) => {

      switch (sortBy) {

        case 'date-desc':
          return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
          );

        case 'date-asc':
          return (
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
          );

        case 'score-desc':
          return (
            b.complianceScore -
            a.complianceScore
          );

        case 'score-asc':
          return (
            a.complianceScore -
            b.complianceScore
          );

        default:
          return 0;
      }
    });

    return result;

  }, [
    inspections,
    search,
    statusFilter,
    sortBy,
  ]);

  return (
    <AppShell>

      <div className="space-y-6">

        {/* Page heading */}
        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Inspection History
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Browse and filter all compliance inspections
            </p>
          </div>

          <button
            type="button"
            onClick={loadInspections}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? 'animate-spin' : ''
              }`}
            />

            Refresh
          </button>

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
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  className="pl-10"
                />

              </div>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >

                <SelectTrigger className="w-full lg:w-44">

                  <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />

                  <SelectValue placeholder="Status" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    All Statuses
                  </SelectItem>

                  <SelectItem value="PASS">
                    Pass
                  </SelectItem>

                  <SelectItem value="WARNING">
                    Warning
                  </SelectItem>

                  <SelectItem value="FAIL">
                    Fail
                  </SelectItem>

                </SelectContent>

              </Select>

              <Select
                value={sortBy}
                onValueChange={setSortBy}
              >

                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="date-desc">
                    Newest First
                  </SelectItem>

                  <SelectItem value="date-asc">
                    Oldest First
                  </SelectItem>

                  <SelectItem value="score-desc">
                    Highest Score
                  </SelectItem>

                  <SelectItem value="score-asc">
                    Lowest Score
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>

          </CardContent>

        </Card>

        {/* Results */}
        {loading ? (

          <LoadingState message="Loading inspections…" />

        ) : error ? (

          <ErrorState
            title="Unable to load inspections"
            onRetry={loadInspections}
          />

        ) : filtered.length === 0 ? (

          <EmptyState
            icon={History}
            title="No inspections found"
            description="Try adjusting your search or filters to find inspections."
          />

        ) : (

          <>

            <p className="text-sm text-muted-foreground">

              {filtered.length} inspection
              {filtered.length !== 1 ? 's' : ''}
              {' '}found

            </p>

            {/* Desktop table */}
            <div className="hidden lg:block">

              <InspectionTable
                inspections={filtered}
              />

            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">

              {filtered.map((inspection) => (

                <Card key={inspection.id}>

                  <CardContent className="p-4 space-y-3">

                    <div className="flex items-center justify-between">

                      <span className="font-mono text-xs font-medium">
                        {inspection.id}
                      </span>

                      <StatusBadge
                        status={
                          inspection.complianceStatus
                        }
                      />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-foreground">
                        {inspection.product?.name ||
                          'Unknown Product'}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {inspection.product?.brand ||
                          'Unknown Brand'}
                      </p>

                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">

                      <span>
                        Score:{' '}

                        <span
                          className={
                            inspection.complianceScore >=
                            75
                              ? 'font-bold text-success'
                              : inspection.complianceScore >=
                                  50
                                ? 'font-bold text-warning'
                                : 'font-bold text-destructive'
                          }
                        >
                          {inspection.complianceScore}%
                        </span>
                      </span>

                      <span>
                        {new Date(
                          inspection.date
                        ).toLocaleDateString(
                          'en-IN'
                        )}
                      </span>

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