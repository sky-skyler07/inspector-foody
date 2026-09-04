import type {
  Product,
  Inspection,
  ComplianceCheck,
  Violation,
  Evidence,
  DashboardStats,
  User,
  SearchResult,
  AnalysisStep,
  ComplianceStatus,
} from './types';

/**
 * Mock API layer for Inspector Foody.
 * Every function returns a Promise to simulate network latency.
 * Replace these functions with real API calls later — the UI only
 * depends on these signatures, not on the mock data itself.
 */

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PRODUCT_IMAGE = (seed: string, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    barcode: '8901234500011',
    name: 'Organic Honey 500g',
    brand: 'NaturePure',
    quantity: '500 g',
    mrp: '₹ 320.00',
    manufacturer: 'NaturePure Foods Pvt Ltd',
    countryOfOrigin: 'India',
    category: 'Honey & Spreads',
    imageUrl: '/products/honey.jpg',
    complianceScore: 92,
    complianceStatus: 'PASS',
    lastInspected: '2026-08-28T10:30:00Z',
  },
  {
    id: 'p2',
    barcode: '8901234500028',
    name: 'Roasted Almonds 200g',
    brand: 'NutriNuts',
    quantity: '200 g',
    mrp: '₹ 480.00',
    manufacturer: 'NutriNuts Snacks Ltd',
    countryOfOrigin: 'India',
    category: 'Dry Fruits',
    imageUrl: '/products/almonds.webp',
    complianceScore: 68,
    complianceStatus: 'WARNING',
    lastInspected: '2026-08-30T14:15:00Z',
  },
  {
    id: 'p3',
    barcode: '8901234500035',
    name: 'Instant Coffee 100g',
    brand: 'MorningBrew',
    quantity: '100 g',
    mrp: '₹ 250.00',
    manufacturer: 'MorningBrew Beverages Pvt Ltd',
    countryOfOrigin: 'India',
    category: 'Beverages',
    imageUrl: '/products/instantant coffee.webp',
    complianceScore: 45,
    complianceStatus: 'FAIL',
    lastInspected: '2026-09-01T09:00:00Z',
  },
  {
    id: 'p4',
    barcode: '8901234500042',
    name: 'Whole Wheat Flour 5kg',
    brand: 'FarmGold',
    quantity: '5 kg',
    mrp: '₹ 280.00',
    manufacturer: '/products/wheat-floor.webp',
    countryOfOrigin: 'India',
    category: 'Grains & Flours',
    imageUrl: PRODUCT_IMAGE('wheat-flour'),
    complianceScore: 88,
    complianceStatus: 'PASS',
    lastInspected: '2026-08-25T11:45:00Z',
  },
  {
    id: 'p5',
    barcode: '8901234500059',
    name: 'Cold Pressed Olive Oil 1L',
    brand: 'OliveGrove',
    quantity: '1 L',
    mrp: '₹ 850.00',
    manufacturer: 'OliveGrove Imports',
    countryOfOrigin: 'Spain',
    category: 'Oils & Ghee',
    imageUrl: '/products/olive-oil.webp',
    complianceScore: 75,
    complianceStatus: 'WARNING',
    lastInspected: '2026-08-27T16:20:00Z',
  },
  {
    id: 'p6',
    barcode: '8901234500066',
    name: 'Dark Chocolate 70% 100g',
    brand: 'CacaoCraft',
    quantity: '100 g',
    mrp: '₹ 180.00',
    manufacturer: 'CacaoCraft Confectionery',
    countryOfOrigin: 'India',
    category: 'Confectionery',
    imageUrl: '/products/dark-chocolate.webp',
    complianceScore: 95,
    complianceStatus: 'PASS',
    lastInspected: '2026-09-02T08:10:00Z',
  },
  {
    id: 'p7',
    barcode: '8901234500073',
    name: 'Basmati Rice Premium 1kg',
    brand: 'RoyalGrain',
    quantity: '1 kg',
    mrp: '₹ 145.00',
    manufacturer: 'RoyalGrain Exports',
    countryOfOrigin: 'India',
    category: 'Grains & Flours',
    imageUrl: PRODUCT_IMAGE('basmati-rice'),
    complianceScore: 52,
    complianceStatus: 'FAIL',
    lastInspected: '2026-08-20T13:00:00Z',
  },
  {
    id: 'p8',
    barcode: '8901234500080',
    name: 'Green Tea Bags 25ct',
    brand: 'ZenLeaf',
    quantity: '25 bags',
    mrp: '₹ 210.00',
    manufacturer: 'ZenLeaf Beverages',
    countryOfOrigin: 'India',
    category: 'Beverages',
    imageUrl: PRODUCT_IMAGE('green-tea'),
    complianceScore: 81,
    complianceStatus: 'PASS',
    lastInspected: '2026-08-29T15:30:00Z',
  },
  {
    id: 'p9',
    barcode: '8901234500097',
    name: 'Spicy Tomato Ketchup 500g',
    brand: 'TangyTom',
    quantity: '500 g',
    mrp: '₹ 95.00',
    manufacturer: 'TangyTom Foods',
    countryOfOrigin: 'India',
    category: 'Sauces & Condiments',
    imageUrl: PRODUCT_IMAGE('ketchup'),
    complianceScore: 63,
    complianceStatus: 'WARNING',
    lastInspected: '2026-08-22T10:00:00Z',
  },
  {
    id: 'p10',
    barcode: '8901234500103',
    name: 'Greek Yogurt 150g',
    brand: 'DairyFresh',
    quantity: '150 g',
    mrp: '₹ 65.00',
    manufacturer: 'DairyFresh Nutrition',
    countryOfOrigin: 'India',
    category: 'Dairy',
    imageUrl: PRODUCT_IMAGE('greek-yogurt'),
    complianceScore: 78,
    complianceStatus: 'PASS',
    lastInspected: '2026-09-01T07:45:00Z',
  },
  {
    id: 'p11',
    barcode: '8901234500110',
    name: 'Quinoa Grains 1kg',
    brand: 'SuperSeed',
    quantity: '1 kg',
    mrp: '₹ 420.00',
    manufacturer: 'SuperSeed Organics',
    countryOfOrigin: 'Peru',
    category: 'Grains & Flours',
    imageUrl: PRODUCT_IMAGE('quinoa'),
    complianceScore: 90,
    complianceStatus: 'PASS',
    lastInspected: '2026-08-26T12:00:00Z',
  },
  {
    id: 'p12',
    barcode: '8901234500127',
    name: 'Mango Juice 1L',
    brand: 'FruitSplash',
    quantity: '1 L',
    mrp: '₹ 120.00',
    manufacturer: 'FruitSplash Beverages',
    countryOfOrigin: 'India',
    category: 'Beverages',
    imageUrl: PRODUCT_IMAGE('mango-juice'),
    complianceScore: 38,
    complianceStatus: 'FAIL',
    lastInspected: '2026-08-19T09:30:00Z',
  },
];

const DEMO_USER: User = {
  id: 'u1',
  name: 'Inspector Aanya',
  email: 'inspector@foody.gov',
  role: 'Senior Compliance Inspector',
};

const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 's1', label: 'Image Uploaded', description: 'Product image received and validated' },
  { id: 's2', label: 'Image Preprocessing', description: 'Enhancing, denoising, and deskewing' },
  { id: 's3', label: 'OCR Extraction', description: 'Reading text from packaging regions' },
  { id: 's4', label: 'Information Extraction', description: 'Parsing product declarations' },
  { id: 's5', label: 'Legal Rules Checking', description: 'Validating mandatory declarations' },
  { id: 's6', label: 'Report Preparation', description: 'Compiling compliance report' },
];

function buildChecks(seed: number): ComplianceCheck[] {
  const base = [
    { category: 'MRP', label: 'Maximum Retail Price', ruleReference: 'LMC Rule 18(2)' },
    { category: 'Net Quantity', label: 'Net Quantity Declaration', ruleReference: 'LMC Rule 6' },
    { category: 'Manufacturer', label: 'Manufacturer / Packer Name', ruleReference: 'LMC Rule 10' },
    { category: 'Country of Origin', label: 'Country of Origin', ruleReference: 'LMC Rule 11' },
    { category: 'Consumer Care', label: 'Consumer Care Contact', ruleReference: 'LMC Rule 14' },
    { category: 'Date Declaration', label: 'Best Before / Expiry Date', ruleReference: 'LMC Rule 7' },
    { category: 'Batch / Lot', label: 'Batch or Lot Number', ruleReference: 'LMC Rule 8' },
    { category: 'Required Markings', label: 'FSSAI / Standard Mark', ruleReference: 'FSS Act 2011' },
    { category: 'Readability', label: 'Font Size & Readability', ruleReference: 'LMC Rule 19' },
    { category: 'Nutrition Info', label: 'Nutritional Information', ruleReference: 'FSSR 2020' },
  ];

  return base.map((c, i) => {
    const r = (seed + i * 7) % 10;
    let status: ComplianceCheck['status'] = 'passed';
    if (r <= 1) status = 'failed';
    else if (r <= 4) status = 'warning';

    const confidence = status === 'passed' ? 90 + ((seed + i) % 9) : 65 + ((seed + i) % 20);

    return {
      id: `check-${i + 1}`,
      category: c.category,
      label: c.label,
      status,
      expected: status === 'passed' ? 'Present and legible' : 'Mandatory declaration',
      actual:
        status === 'passed'
          ? 'Present and legible'
          : status === 'warning'
            ? 'Present but partially legible'
            : 'Missing or illegible',
      confidence,
      ruleReference: c.ruleReference,
      message:
        status === 'passed'
          ? 'All mandatory information is present and clearly legible.'
          : status === 'warning'
            ? 'Information is present but font size or placement does not meet readability standards.'
            : 'Required declaration is missing from the packaging label.',
    } as ComplianceCheck;
  });
}

function buildViolations(checks: ComplianceCheck[], imageUrl: string): Violation[] {
  return checks
    .filter((c) => c.status !== 'passed')
    .map((c, i) => {
      const severity = c.status === 'failed' ? (i === 0 ? 'critical' : 'major') : 'minor';
      const evidence: Evidence[] = [
        {
          id: `ev-${c.id}`,
          violationId: `v-${c.id}`,
          imageUrl,
          region: {
            x: 10 + i * 15,
            y: 20 + i * 12,
            width: 35,
            height: 20,
          },
          label: c.category,
        },
      ];
      return {
        id: `v-${c.id}`,
        title: `${c.label} non-compliance`,
        severity,
        confidence: c.confidence,
        explanation: c.message,
        ruleReference: c.ruleReference,
        evidence,
        reviewed: false,
      } as Violation;
    });
}

function computeStatus(score: number): ComplianceStatus {
  if (score >= 75) return 'PASS';
  if (score >= 50) return 'WARNING';
  return 'FAIL';
}

function buildInspection(product: Product): Inspection {
  const seed = parseInt(product.id.replace(/\D/g, '')) || 1;
  const checks = buildChecks(seed);
  const violations = buildViolations(checks, product.imageUrl);
  const passed = checks.filter((c) => c.status === 'passed').length;
  const score = Math.round((passed / checks.length) * 100);
  const status = computeStatus(score);

  return {
    id: `INS-${Date.now().toString(36).toUpperCase()}`,
    productId: product.id,
    product,
    imageUrl: product.imageUrl,
    complianceScore: score,
    complianceStatus: status,
    checks,
    violations,
    inspector: DEMO_USER.name,
    date: new Date().toISOString(),
    reviewStatus: 'pending',
  };
}

const MOCK_INSPECTIONS: Inspection[] = MOCK_PRODUCTS.slice(0, 8).map((p, i) => {
  const ins = buildInspection(p);
  ins.id = `INS-2026-${String(1000 + i).padStart(4, '0')}`;
  ins.date = new Date(Date.now() - i * 86400000 * 1.5).toISOString();
  ins.reviewStatus = i % 3 === 0 ? 'reviewed' : i % 3 === 1 ? 'pending' : 'flagged';
  return ins;
});

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function login(email: string, password: string): Promise<User> {
  await delay(600);
  if (!email || !password) throw new Error('Email and password are required');
  if (password.length < 4) throw new Error('Invalid credentials');
  return { ...DEMO_USER, email };
}

export async function searchProducts(
  query: string,
  page = 1,
  pageSize = 6,
  filters?: { category?: string; status?: ComplianceStatus | 'all' }
): Promise<SearchResult> {
  await delay(350);
  let filtered = MOCK_PRODUCTS;
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q)
    );
  }
  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter((p) => p.complianceStatus === filters.status);
  }
  const start = (page - 1) * pageSize;
  return {
    products: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

export async function getProduct(id: string): Promise<Product> {
  await delay(250);
  const p = MOCK_PRODUCTS.find((x) => x.id === id || x.barcode === id);
  if (!p) throw new Error('Product not found');
  return p;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await delay(300);
  return MOCK_PRODUCTS.slice(0, 6);
}

export async function uploadInspection(
  productId: string,
  imageDataUrl: string
): Promise<{ inspectionId: string }> {
  await delay(400);
  const product = MOCK_PRODUCTS.find((p) => p.id === productId) ?? MOCK_PRODUCTS[0];
  const ins = buildInspection(product);
  ins.imageUrl = imageDataUrl;
  ins.id = `INS-${Date.now().toString(36).toUpperCase()}`;
  _latestInspection = ins;
  return { inspectionId: ins.id };
}

let _latestInspection: Inspection | null = null;

export async function analyzeInspection(
  inspectionId: string,
  onStep?: (stepIndex: number) => void
): Promise<Inspection> {
  for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
    await delay(700 + Math.random() * 400);
    onStep?.(i);
  }
  if (!_latestInspection) {
    const product = MOCK_PRODUCTS[0];
    _latestInspection = buildInspection(product);
  }
  _latestInspection.id = inspectionId;
  return _latestInspection;
}

export function getAnalysisSteps(): AnalysisStep[] {
  return ANALYSIS_STEPS;
}

export async function getInspection(id: string): Promise<Inspection> {
  await delay(300);
  if (_latestInspection?.id === id) return _latestInspection;
  const found = MOCK_INSPECTIONS.find((i) => i.id === id);
  if (found) return found;
  if (_latestInspection) return _latestInspection;
  return MOCK_INSPECTIONS[0];
}

export async function getInspections(): Promise<Inspection[]> {
  await delay(350);
  return MOCK_INSPECTIONS;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(400);
  const total = MOCK_INSPECTIONS.length;
  const compliance = Math.round(
    MOCK_INSPECTIONS.reduce((s, i) => s + i.complianceScore, 0) / total
  );
  const violations = MOCK_INSPECTIONS.reduce((s, i) => s + i.violations.length, 0);
  const today = MOCK_INSPECTIONS.filter(
    (i) => new Date(i.date).toDateString() === new Date().toDateString()
  ).length;

  const trend = [
    { date: 'Aug 25', compliance: 78, inspections: 3 },
    { date: 'Aug 27', compliance: 82, inspections: 5 },
    { date: 'Aug 29', compliance: 75, inspections: 2 },
    { date: 'Aug 31', compliance: 88, inspections: 4 },
    { date: 'Sep 01', compliance: 71, inspections: 6 },
    { date: 'Sep 02', compliance: 84, inspections: 3 },
    { date: 'Sep 03', compliance: 79, inspections: 4 },
  ];

  const violationMap: Record<string, number> = {};
  MOCK_INSPECTIONS.forEach((ins) => {
    ins.violations.forEach((v) => {
      const cat = ins.checks.find((c) => `v-${c.id}` === v.id)?.category ?? 'Other';
      violationMap[cat] = (violationMap[cat] ?? 0) + 1;
    });
  });
  const violationDistribution = Object.entries(violationMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalInspections: total,
    compliancePercentage: compliance,
    violationsDetected: violations,
    todaysInspections: today || 2,
    trend,
    violationDistribution,
    recentInspections: MOCK_INSPECTIONS.slice(0, 5),
  };
}

export async function generateReport(inspectionId: string): Promise<{ url: string }> {
  await delay(500);
  return { url: `/inspections/${inspectionId}/report` };
}

export async function markViolationReviewed(
  inspectionId: string,
  violationId: string
): Promise<void> {
  await delay(200);
  const ins =
    _latestInspection?.id === inspectionId
      ? _latestInspection
      : MOCK_INSPECTIONS.find((i) => i.id === inspectionId);
  if (ins) {
    const v = ins.violations.find((x) => x.id === violationId);
    if (v) v.reviewed = true;
  }
}

export const DEMO_CREDENTIALS = {
  email: 'inspector@foody.gov',
  password: 'inspect123',
};
