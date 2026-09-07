const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ScanResponse {
  inspection_id: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  score: number;
  confidence: number;
  fields: {
    product_name: string | null;
    batch_no: string | null;
    manufacturing_date: string | null;
    expiry_date: string | null;
    mrp: string | null;
    quantity: string | null;
    manufacturer: string | null;
    country_of_origin: string | null;
  };
  issues: {
  field: string;
  message: string;
  severity: string;
}[];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      message || `API request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function uploadInspection(
  file: File
): Promise<ScanResponse> {
  const formData = new FormData();

  formData.append('file', file);

  return request<ScanResponse>('/api/scan', {
    method: 'POST',
    body: formData,
  });
}

function buildImageUrl(imagePath: string | null) {
  if (!imagePath) {
    return '/placeholder.svg';
  }

  const filename = imagePath.split(/[/\\]/).pop();

  if (!filename) {
    return '/placeholder.svg';
  }

  return `${API_URL}/uploads/${encodeURIComponent(filename)}`;
}

function buildChecks(data: any) {
  const fields = data.fields || {};

  return [
    {
      id: 'batch',
      label: 'Batch / Lot Number',
      ruleReference: 'Mandatory batch identification',
      status: fields.batch_no ? 'passed' : 'failed',
      actual: fields.batch_no || 'Not detected',
      details: fields.batch_no
        ? `Batch number detected: ${fields.batch_no}`
        : 'Batch number was not detected.',
    },
    {
      id: 'manufacturing-date',
      label: 'Manufacturing Date',
      ruleReference: 'Mandatory manufacturing date',
      status: fields.manufacturing_date ? 'passed' : 'warning',
      actual: fields.manufacturing_date || 'Not detected',
      details: fields.manufacturing_date
        ? `Manufacturing date detected: ${fields.manufacturing_date}`
        : 'Manufacturing date was not detected.',
    },
    {
      id: 'expiry',
      label: 'Expiry / Best Before',
      ruleReference: 'Mandatory shelf-life declaration',
      status: fields.expiry_date ? 'passed' : 'failed',
      actual: fields.expiry_date || 'Not detected',
      details: fields.expiry_date
        ? `Expiry / best-before information detected: ${fields.expiry_date}`
        : 'Expiry / best-before information was not detected.',
    },
    {
      id: 'mrp',
      label: 'Maximum Retail Price',
      ruleReference: 'Mandatory MRP declaration',
      status: fields.mrp ? 'passed' : 'failed',
      actual: fields.mrp ? `₹${fields.mrp}` : 'Not detected',
      details: fields.mrp
        ? `MRP detected: ₹${fields.mrp}`
        : 'MRP was not detected.',
    },
    {
      id: 'quantity',
      label: 'Net Quantity',
      ruleReference: 'Mandatory quantity declaration',
      status: fields.quantity ? 'passed' : 'failed',
      actual: fields.quantity ? `${fields.quantity} g` : 'Not detected',
      details: fields.quantity
        ? `Net quantity detected: ${fields.quantity}`
        : 'Net quantity was not detected.',
    },
    {
      id: 'manufacturer',
      label: 'Manufacturer',
      ruleReference: 'Mandatory manufacturer / packer declaration',
      status: fields.manufacturer ? 'passed' : 'failed',
      actual: fields.manufacturer || 'Not detected',
      details: fields.manufacturer
        ? `Manufacturer detected: ${fields.manufacturer}`
        : 'Manufacturer was not detected.',
    },
    {
      id: 'origin',
      label: 'Country of Origin',
      ruleReference: 'Country of origin declaration',
      status: fields.country_of_origin ? 'passed' : 'warning',
      actual: fields.country_of_origin || 'Not detected',
      details: fields.country_of_origin
        ? `Country of origin: ${fields.country_of_origin}`
        : 'Country of origin was not detected.',
    },
  ];
}

function buildViolations(data: any) {
  const issues = data.issues || [];

  return issues.map((issue: any, index: number) => {
    const message =
      typeof issue === 'string'
        ? issue
        : issue.message || 'Compliance issue detected';

    const field =
      typeof issue === 'string'
        ? 'Compliance Requirement'
        : issue.field || 'Compliance Requirement';

    const severity =
      typeof issue === 'string'
        ? 'high'
        : issue.severity || 'medium';

    return {
      id: `violation-${index + 1}`,
      title: field,
      description: message,
      severity,
      confidence: data.confidence || 0,
      explanation: message,
      reviewed: false,
      ruleReference:
        'Food label compliance requirement',
      evidence: [],
    };
  });
}

function mapBackendInspection(data: any) {
  const fields = data.fields || {};

  const status =
    data.status === 'PASS'
      ? 'PASS'
      : data.status === 'WARNING'
        ? 'WARNING'
        : 'FAIL';

  const inspectionId =
    data.inspection_id || data.id;

  return {
    id: inspectionId,
    productId: data.product_id || 'unknown',

    product: {
      id: data.product_id || 'unknown',
      name: fields.product_name || 'Unknown Product',

      // Keep brand separate from manufacturer conceptually.
      brand: 'Detected from label',

      barcode: data.barcode || 'Not detected',

      category: 'Food Product',

      imageUrl: buildImageUrl(
        data.image_path
      ),
    },

    imageUrl: buildImageUrl(
      data.image_path
    ),

    complianceScore:
      typeof data.score === 'number'
        ? data.score
        : 0,

    complianceStatus: status,

    checks: buildChecks(data),

    violations: buildViolations(data),

    inspector:
      data.inspector ||
      'Inspector Aanya',

    date:
      data.created_at ||
      new Date().toISOString(),

    reviewStatus:
      data.review_status ||
      'pending',
  };
}

export async function getInspection(id: string) {
  const data = await request<any>(
    `/api/inspections/${encodeURIComponent(id)}`
  );

  return mapBackendInspection(data);
}

export async function getInspections() {
  const data = await request<any[]>('/api/inspections');
  return data.map(mapBackendInspection);
}

export async function getDashboardStats() {
  const inspections = await getInspections();

  const totalInspections = inspections.length;

  const compliancePercentage =
    totalInspections > 0
      ? Math.round(
          inspections.reduce(
            (sum, inspection) =>
              sum + inspection.complianceScore,
            0
          ) / totalInspections
        )
      : 0;

  const violationsDetected = inspections.reduce(
    (sum, inspection) =>
      sum + inspection.violations.length,
    0
  );

  const today = new Date();

  const todaysInspections = inspections.filter(
    (inspection) => {
      const date = new Date(inspection.date);

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }
  ).length;

  const groupedByDate: Record<
    string,
    {
      total: number;
      score: number;
    }
  > = {};

  inspections.forEach((inspection) => {
    const date = new Date(inspection.date);

    const key = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });

    if (!groupedByDate[key]) {
      groupedByDate[key] = {
        total: 0,
        score: 0,
      };
    }

    groupedByDate[key].total += 1;
    groupedByDate[key].score +=
      inspection.complianceScore;
  });

  const trend = Object.entries(groupedByDate)
    .map(([date, value]) => ({
      date,
      compliance: Math.round(
        value.score / value.total
      ),
      inspections: value.total,
    }))
    .reverse()
    .slice(-7);

  const violationMap: Record<string, number> = {};

  inspections.forEach((inspection) => {
    inspection.checks
      .filter(
        (check) => check.status !== 'passed'
      )
      .forEach((check) => {
        violationMap[check.category] =
          (violationMap[check.category] || 0) + 1;
      });
  });

  const violationDistribution =
    Object.entries(violationMap)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, 6);

  const recentInspections = [...inspections]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5);

  return {
    totalInspections,
    compliancePercentage,
    violationsDetected,
    todaysInspections,
    trend,
    violationDistribution,
    recentInspections,
  };
}