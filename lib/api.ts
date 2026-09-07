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
  issues: string[];
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

  return issues.map((issue: string, index: number) => ({
    id: `violation-${index + 1}`,
    title: issue,
    description: issue,
    severity: 'high',
    confidence: data.confidence || 0,
    explanation: issue,
    reviewed: false,
    ruleReference: 'Food label compliance requirement',
    evidence: [],
  }));
}

function mapBackendInspection(data: any) {
  const fields = data.fields || {};

  const status =
  data.status === 'PASS'
    ? 'PASS'
    : data.status === 'WARNING'
      ? 'WARNING'
      : 'FAIL';

  return {
    id: data.inspection_id,
    productId: data.product_id || 'unknown',

    product: {
      id: data.product_id || 'unknown',
      name: fields.product_name || 'Unknown Product',
      brand: fields.manufacturer || 'Unknown Manufacturer',
      barcode: 'Not detected',
      category: 'Food Product',
      imageUrl: buildImageUrl(data.image_path),
    },

    imageUrl: buildImageUrl(data.image_path),

    complianceScore: data.score || 0,
    complianceStatus: status,

    checks: buildChecks(data),
    violations: buildViolations(data),

    inspector: data.inspector || 'Inspector Aanya',
    date: data.created_at || new Date().toISOString(),
    reviewStatus: data.review_status || 'pending',
  };
}

export async function getInspection(id: string) {
  const data = await request<any>(
    `/api/inspections/${encodeURIComponent(id)}`
  );

  return mapBackendInspection(data);
}

export async function getInspections() {
  return request<any[]>('/api/inspections');
}