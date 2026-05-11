const BASE_URL = 'https://office.jwrgnc.com/api/v1';
export const SITE_SLUG = 'jwrg';

export interface ApiPhotoVariant {
  width: number | null;
  height: number | null;
  jpg: string | null;
  webp: string | null;
  avif: string | null;
}

export interface ApiPhoto {
  id: string;
  order: number;
  caption: string | null;
  alt: string | null;
  is_primary: boolean;
  urls: {
    '400': ApiPhotoVariant;
    '800': ApiPhotoVariant;
    '1200': ApiPhotoVariant;
    '1600': ApiPhotoVariant;
    original: string | null;
  };
}

/**
 * Pick a single jpg URL for a photo at a target width rung.
 * Falls back to `original` if the requested rung hasn't rendered yet
 * (conversions queue async on the office side; URLs may briefly be null).
 */
export function photoSrc(
  photo: ApiPhoto | null | undefined,
  width: 400 | 800 | 1200 | 1600 = 800,
): string | null {
  if (!photo) return null;
  const variant = photo.urls[String(width) as '400' | '800' | '1200' | '1600'];
  return variant?.jpg ?? photo.urls.original;
}

export interface ApiDocument {
  id: string;
  title: string;
  description: string | null;
  document_type: string;
  sort_order: number;
  is_public: boolean;
  url: string | null;
  expires_at: string | null;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: 'Contract',
  addendum: 'Addendum',
  disclosure: 'Disclosure',
  inspection_report: 'Inspection Report',
  appraisal: 'Appraisal',
  title_report: 'Title Report',
  survey: 'Survey',
  plat: 'Plat',
  hoa_docs: 'HOA Docs',
  tax_record: 'Tax Record',
  insurance: 'Insurance',
  license: 'License',
  marketing: 'Marketing',
  photo: 'Photo',
  correspondence: 'Correspondence',
  other: 'Other',
};

export function documentTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Document';
  return (
    DOCUMENT_TYPE_LABELS[type] ??
    type
      .split('_')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ')
  );
}

export interface ApiListing {
  id: string;
  slug: string;
  mls_number: string | null;
  marketing_title: string | null;
  status: 'active' | 'coming_soon' | 'pending' | 'under_contract' | 'sold';
  status_label: string;
  featured: boolean;
  property_type: string | null;
  listing_type: string | null;
  address: string;
  address_line_2: string | null;
  city: string;
  state: string;
  zip: string | null;
  county: string;
  latitude: number | null;
  longitude: number | null;
  list_price: string;
  original_price: string | null;
  sold_price: string | null;
  bedrooms: number | null;
  bathrooms_full: number | null;
  bathrooms_half: number | null;
  sqft: number | null;
  lot_size_sqft: number | null;
  lot_size_acres: string | null;
  year_built: number | null;
  garage_spaces: number | null;
  stories: number | null;
  hoa_fee: string | null;
  hoa_frequency: string | null;
  description: string;
  full_description: string | null;
  directions: string | null;
  features: string[];
  virtual_tour_url: string | null;
  list_date: string | null;
  sold_date: string | null;
  days_on_market: number | null;
  agent: { name: string; phone: string } | null;
  co_agent: { name: string; phone: string } | null;
  primary_photo: ApiPhoto | null;
  photo_count: number;
  // Detail-only
  photos?: ApiPhoto[];
  documents?: ApiDocument[];
}

export type PublicStatus = 'available' | 'pending' | 'sold';

export function publicStatus(status: ApiListing['status']): PublicStatus {
  switch (status) {
    case 'active':
    case 'coming_soon':
      return 'available';
    case 'pending':
    case 'under_contract':
      return 'pending';
    case 'sold':
      return 'sold';
  }
}

export function formatPrice(price: string | null | undefined): string {
  if (!price) return '—';
  const n = parseFloat(price);
  if (Number.isNaN(n)) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function formatAcres(acres: string | null): string {
  if (!acres) return '';
  const n = parseFloat(acres);
  if (Number.isNaN(n)) return '';
  return (n % 1 === 0 ? n.toFixed(0) : n.toString()) + ' ac';
}

export function formatSqft(sqft: number | null): string {
  if (!sqft) return '';
  return sqft.toLocaleString('en-US') + ' sqft';
}

export function formatBedsBaths(l: ApiListing): string {
  const parts: string[] = [];
  if (l.bedrooms) parts.push(`${l.bedrooms} bd`);
  const baths = (l.bathrooms_full ?? 0) + (l.bathrooms_half ?? 0) * 0.5;
  if (baths) parts.push(`${baths} ba`);
  return parts.join(' · ');
}

export interface ListingsQuery {
  featured?: boolean;
  county?: string;
  city?: string;
  status?: ApiListing['status'];
  perPage?: number;
}

export async function fetchListings(q: ListingsQuery = {}): Promise<ApiListing[]> {
  const params = new URLSearchParams();
  params.set('site', SITE_SLUG);
  params.set('per_page', String(q.perPage ?? 50));
  if (q.featured) params.set('featured', '1');
  if (q.county) params.set('county', q.county);
  if (q.city) params.set('city', q.city);
  if (q.status) params.set('status', q.status);

  try {
    const res = await fetch(`${BASE_URL}/listings?${params}`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as ApiListing[];
  } catch {
    return [];
  }
}

export async function fetchListing(slug: string): Promise<ApiListing | null> {
  try {
    const res = await fetch(`${BASE_URL}/listings/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ApiListing;
  } catch {
    return null;
  }
}

export interface ApiNeighborhood {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  marketing_description: string | null;
  status: 'planning' | 'under_development' | 'active_sales' | 'sold_out' | 'established' | null;

  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  latitude: number | null;
  longitude: number | null;

  total_lots: number | null;
  total_phases: number | null;

  hoa: {
    name: string | null;
    fee: number | null;
    frequency: 'monthly' | 'quarterly' | 'annually' | null;
    contact: string | null;
  };

  amenities: string[];
  school_district: string | null;
  utilities: string[];
  deed_restrictions_summary: string | null;
  website_url: string | null;

  primary_photo: ApiPhoto | null;
  photos?: ApiPhoto[];
  photo_count?: number;
  listings_count?: number;
}

export async function fetchNeighborhoods(): Promise<ApiNeighborhood[]> {
  try {
    const res = await fetch(`${BASE_URL}/neighborhoods?per_page=100`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as ApiNeighborhood[];
  } catch {
    return [];
  }
}

export async function fetchNeighborhood(slug: string): Promise<ApiNeighborhood | null> {
  try {
    const res = await fetch(`${BASE_URL}/neighborhoods/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ApiNeighborhood;
  } catch {
    return null;
  }
}

export interface ApiTeamMember {
  id: number;
  slug: string;
  name: string;
  title: string | null;
  short_bio: string | null;
  bio: string | null;

  public_email: string | null;
  public_phone: string | null;

  license_number: string | null;
  license_state: string | null;
  license_expiry: string | null;

  specialties: string[];
  social_links: Record<string, string>;
  years_experience: number | null;

  sort_order: number | null;
  published_at: string | null;

  primary_photo: ApiPhoto | null;
  photos?: ApiPhoto[];
  photo_count?: number;
  marketing_sites?: string[];
}

export async function fetchTeam(): Promise<ApiTeamMember[]> {
  try {
    const res = await fetch(`${BASE_URL}/team?site=${SITE_SLUG}&per_page=100`);
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as ApiTeamMember[];
  } catch {
    return [];
  }
}

export async function fetchTeamMember(slug: string): Promise<ApiTeamMember | null> {
  try {
    const res = await fetch(`${BASE_URL}/team/${slug}?site=${SITE_SLUG}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as ApiTeamMember;
  } catch {
    return null;
  }
}

export interface FormSubmitResult {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function submitForm(
  formId: string | null,
  payload: Record<string, unknown>,
): Promise<FormSubmitResult> {
  if (!formId) {
    return { ok: false, message: 'This form is not yet configured. Please call the office.' };
  }
  try {
    const res = await fetch(`${BASE_URL}/forms/${formId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      return { ok: true, message: json.message ?? 'Thank you for your submission.' };
    }
    return {
      ok: false,
      message: json.message ?? 'Submission failed. Please try again.',
      errors: json.errors,
    };
  } catch {
    return { ok: false, message: 'Could not reach the server. Please try again.' };
  }
}
