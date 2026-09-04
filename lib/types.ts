export type ComplianceStatus = 'PASS' | 'WARNING' | 'FAIL';

export type CheckStatus = 'passed' | 'warning' | 'failed';

export type Severity = 'critical' | 'major' | 'minor';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  quantity: string;
  mrp: string;
  manufacturer: string;
  countryOfOrigin: string;
  category: string;
  imageUrl: string;
  complianceScore: number;
  complianceStatus: ComplianceStatus;
  lastInspected?: string;
}

export interface Evidence {
  id: string;
  violationId: string;
  imageUrl: string;
  /** Bounding box as percentages of image dimensions (0-100) */
  region: { x: number; y: number; width: number; height: number };
  label: string;
}

export interface ComplianceCheck {
  id: string;
  category: string;
  label: string;
  status: CheckStatus;
  expected?: string;
  actual?: string;
  confidence: number;
  ruleReference: string;
  message: string;
}

export interface Violation {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  explanation: string;
  ruleReference: string;
  evidence: Evidence[];
  reviewed: boolean;
}

export interface Inspection {
  id: string;
  productId: string;
  product: Product;
  imageUrl: string;
  complianceScore: number;
  complianceStatus: ComplianceStatus;
  checks: ComplianceCheck[];
  violations: Violation[];
  inspector: string;
  date: string;
  reviewStatus: 'pending' | 'reviewed' | 'flagged';
}

export interface DashboardStats {
  totalInspections: number;
  compliancePercentage: number;
  violationsDetected: number;
  todaysInspections: number;
  trend: { date: string; compliance: number; inspections: number }[];
  violationDistribution: { category: string; count: number }[];
  recentInspections: Inspection[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  description: string;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}
