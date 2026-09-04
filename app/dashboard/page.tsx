'use client';

import { AppShell } from '@/components/shared/app-shell';
import { StatCard } from '@/components/shared/stat-card';
import { InspectionTable } from '@/components/shared/inspection-table';
import { LoadingState } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  CalendarCheck,
  ScanLine,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { getDashboardStats } from '@/lib/mock-api';
import type { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <AppShell>
        <LoadingState message="Loading dashboard…" />
      </AppShell>
    );

  if (!stats) return <AppShell><LoadingState /></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compliance inspection overview and statistics
            </p>
          </div>
          <Link href="/scan">
            <Button className="gap-2">
              <ScanLine className="h-4 w-4" />
              New Inspection
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Inspections"
            value={stats.totalInspections}
            icon={ClipboardCheck}
            accent="primary"
            trend={{ value: '+12%', direction: 'up' }}
          />
          <StatCard
            label="Compliance Rate"
            value={`${stats.compliancePercentage}%`}
            icon={ShieldCheck}
            accent="success"
            trend={{ value: '+3%', direction: 'up' }}
          />
          <StatCard
            label="Violations Detected"
            value={stats.violationsDetected}
            icon={AlertTriangle}
            accent="destructive"
            trend={{ value: '-8%', direction: 'down' }}
          />
          <StatCard
            label="Today's Inspections"
            value={stats.todaysInspections}
            icon={CalendarCheck}
            accent="warning"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Compliance trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.trend}>
                  <defs>
                    <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="compliance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#complianceGradient)"
                    name="Compliance %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Violation distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Violation Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.violationDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Violations" radius={[0, 4, 4, 0]}>
                    {stats.violationDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === 0
                            ? 'hsl(var(--destructive))'
                            : i === 1
                              ? 'hsl(var(--warning))'
                              : 'hsl(var(--primary))'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent inspections */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Inspections</CardTitle>
              <Link href="/inspections">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <InspectionTable inspections={stats.recentInspections} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
