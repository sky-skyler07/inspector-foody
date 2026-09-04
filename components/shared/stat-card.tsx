'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: string; direction: 'up' | 'down' };
  accent?: 'primary' | 'secondary' | 'success' | 'destructive' | 'warning';
}

const accentConfig = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/15 text-secondary-foreground',
  success: 'bg-success/10 text-success',
  destructive: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
};

export function StatCard({ label, value, icon: Icon, trend, accent = 'primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-xs">
                {trend.direction === 'up' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span
                  className={
                    trend.direction === 'up' ? 'text-success' : 'text-destructive'
                  }
                >
                  {trend.value}
                </span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl shrink-0',
              accentConfig[accent]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
