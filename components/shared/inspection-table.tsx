'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import Link from 'next/link';
import { StatusBadge, ReviewBadge } from './status-badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { Inspection } from '@/lib/types';

interface InspectionTableProps {
  inspections: Inspection[];
}

export function InspectionTable({ inspections }: InspectionTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Inspection ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Inspector</TableHead>
            <TableHead className="text-center">Review</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspections.map((ins) => (
            <TableRow key={ins.id}>
              <TableCell className="font-mono text-xs font-medium">{ins.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground line-clamp-1">
                    {ins.product.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{ins.product.brand}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge status={ins.complianceStatus} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(ins.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{ins.inspector}</TableCell>
              <TableCell className="text-center">
                <ReviewBadge status={ins.reviewStatus} />
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/inspections/${ins.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
