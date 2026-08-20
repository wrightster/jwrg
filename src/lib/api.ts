// Thin shim over @jw/shared/api — binds JWRG's site slug and re-exports
// everything else. Canonical source lives in packages/shared/src/api.ts.
// JWLC is the reference; if you're tempted to add logic here, add it there.

import {
  BASE_URL,
  fetchAllListings as sharedFetchAllListings,
  fetchListing as sharedFetchListing,
  fetchListings as sharedFetchListings,
  fetchNeighborhoods as sharedFetchNeighborhoods,
  fetchTeam as sharedFetchTeam,
  fetchTeamMember as sharedFetchTeamMember,
  formatPrice,
  normalizeListingLabel,
  type ApiListing,
  type ApiTeamMember,
  type ListingsQuery,
} from '@jw/shared/api';

export * from '@jw/shared/api';

export const SITE_SLUG = 'jwrg';

// The office labels the `active` status "Active"; both public sites say
// "Available" instead, so every fetcher that returns listings normalizes.
export const fetchListings = async (q: ListingsQuery = {}): Promise<ApiListing[]> =>
  (await sharedFetchListings(SITE_SLUG, q)).map(normalizeListingLabel);

export const fetchAllListings = async (q: ListingsQuery = {}): Promise<ApiListing[]> =>
  (await sharedFetchAllListings(SITE_SLUG, q)).map(normalizeListingLabel);

export const fetchListing = async (slug: string): Promise<ApiListing | null> => {
  const listing = await sharedFetchListing(slug);
  if (!listing) return null;
  // The office's by-slug endpoint isn't site-scoped (unlike the index's ?site=
  // filter), so a listing unpublished from this site still resolves by slug.
  // Enforce publication here, in the shim that binds the site slug.
  if (!listing.marketing_sites?.includes(SITE_SLUG)) return null;
  return normalizeListingLabel(listing);
};

export const fetchTeam = () => sharedFetchTeam(SITE_SLUG);
export const fetchTeamMember = (slug: string) => sharedFetchTeamMember(slug, SITE_SLUG);
// Bind the site slug so neighborhood cards' listings_count reflects only what's
// live on JWRG (see the shared fetchNeighborhoods + NeighborhoodController).
export const fetchNeighborhoods = () => sharedFetchNeighborhoods(SITE_SLUG);

// Subdivision lots for a neighborhood, from the office public API
// (`GET /neighborhoods/{slug}/lots`, served by LotResource). Marketing-safe
// fields only; `base_price` is the advertised asking price (decimal string).
// JWRG-local for now — promote to @jw/shared if JWLC needs it too.
export type LotStatus =
  | 'available'
  | 'reserved'
  | 'under_contract'
  | 'sold'
  | 'not_released'
  | 'common_area';

export interface ApiLotBuilder {
  name: string;
  short_name: string | null;
  slug: string | null;
  website_url: string | null;
  brand_color: string | null;
}

export interface ApiLotAgent {
  name: string;
  slug: string | null;
}

export interface ApiLotDocument {
  id: string | number;
  title: string;
  document_type: string | null;
  url: string | null;
  /** Drives the viewer's render path (PDF.js vs image vs download). */
  mime?: string | null;
}

export interface ApiLot {
  id: string;
  lot_number: string;
  status: LotStatus;
  lot_type: string | null;
  address: string | null;
  /** Public per-lot copy set in the office. Falls back to generated text. */
  marketing_description?: string | null;
  size_acres: number | string | null;
  size_sqft: number | string | null;
  base_price: number | string | null;
  // The office LotResource also returns these; older office builds omit them,
  // so treat as optional. See LotResource@toArray.
  builder?: ApiLotBuilder | null;
  agent?: ApiLotAgent | null;
  documents?: ApiLotDocument[];
}

// ---------- Lot presentation helpers (shared by LotCard + the detail page) ----------

// The lot map/card colors reuse the listing status-pill palette (keyed by
// `data-status` in @jw/shared components.css): available→red, gold for the
// in-between states, dark for sold, gray for coming-soon. `colorKey` is the
// listing status whose color we borrow; `label` is the human text shown.
const LOT_STATUS_META: Record<LotStatus, { label: string; colorKey: string }> = {
  available: { label: 'Available', colorKey: 'available' },
  reserved: { label: 'Reserved', colorKey: 'under_contract' },
  under_contract: { label: 'Under Contract', colorKey: 'under_contract' },
  sold: { label: 'Sold', colorKey: 'sold' },
  not_released: { label: 'Coming Soon', colorKey: 'coming_soon' },
  common_area: { label: 'Common Area', colorKey: 'coming_soon' },
};

export const lotStatusMeta = (status: LotStatus): { label: string; colorKey: string } =>
  LOT_STATUS_META[status] ?? { label: String(status), colorKey: 'coming_soon' };

// Office LotType enum labels (mirror App\Enums\LotType::getLabel).
const LOT_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard',
  premium: 'Premium',
  corner: 'Corner',
  cul_de_sac: 'Cul-de-Sac',
  waterfront: 'Waterfront',
  wooded: 'Wooded',
  common_area: 'Common Area',
  commercial: 'Commercial',
};

export const lotTypeLabel = (lotType: string | null | undefined): string | null =>
  lotType ? (LOT_TYPE_LABELS[lotType] ?? lotType.replace(/_/g, ' ')) : null;

export const lotTitle = (lot: ApiLot): string => lot.address?.trim() || `Lot ${lot.lot_number}`;

export const lotAcresLabel = (lot: ApiLot): string | null => {
  const n = lot.size_acres != null ? Number(lot.size_acres) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  const v = n % 1 === 0 ? String(n) : String(Number(n.toFixed(2)));
  return `${v} Acre${n === 1 ? '' : 's'}`;
};

export const lotSqftLabel = (lot: ApiLot): string | null => {
  const n = lot.size_sqft != null ? Number(lot.size_sqft) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${Math.round(n).toLocaleString('en-US')} sq ft`;
};

// Advertised price, or a soft "inquire" when a lot has no public base_price.
export const lotPriceLabel = (lot: ApiLot): string => {
  const n = lot.base_price != null ? Number(lot.base_price) : NaN;
  if (!Number.isFinite(n) || n <= 0) return 'Inquire for pricing';
  return formatPrice(String(n));
};

// Path to a lot's detail page, nested under its neighborhood (lot_number is
// only unique within a neighborhood, so the route must carry both).
export const lotHref = (neighborhoodSlug: string, lot: ApiLot): string =>
  `/neighborhoods/${neighborhoodSlug}/lots/${encodeURIComponent(lot.lot_number)}`;

// Small in-process memo mirroring @jw/shared's cachedJson TTL (60s), so the
// neighborhoods index (one call per card) and the detail page don't re-hit the
// office for the same slug within a request burst. Keyed by slug.
const LOTS_TTL_MS = 60_000;
const _lotsMemo = new Map<string, { at: number; data: ApiLot[] }>();

/**
 * Agents the office has assigned to a neighborhood AND flagged `list_on_website`.
 *
 * Display only. This is deliberately NOT the lead-routing set: the office keeps
 * `list_on_website` and `round_robin_off` as separate flags on the
 * neighborhood_user pivot, so an agent can be shown without taking intake, or
 * take intake without being shown. Routing stays with the neighborhood id the
 * form already sends. Returns [] when nobody is flagged, which is common — the
 * caller falls back to the brokerage contact block.
 */
const TEAM_TTL_MS = 60_000;
const _nbTeamMemo = new Map<string, { at: number; data: ApiTeamMember[] }>();

export async function fetchNeighborhoodTeam(slug: string): Promise<ApiTeamMember[]> {
  const hit = _nbTeamMemo.get(slug);
  if (hit && Date.now() - hit.at < TEAM_TTL_MS) return hit.data;
  try {
    const res = await fetch(`${BASE_URL}/neighborhoods/${slug}/team`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = (json?.data ?? []) as ApiTeamMember[];
    _nbTeamMemo.set(slug, { at: Date.now(), data });
    return data;
  } catch {
    return [];
  }
}

export async function fetchNeighborhoodLots(slug: string): Promise<ApiLot[]> {
  const hit = _lotsMemo.get(slug);
  if (hit && Date.now() - hit.at < LOTS_TTL_MS) return hit.data;
  try {
    const res = await fetch(`${BASE_URL}/neighborhoods/${slug}/lots`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = (json?.data ?? []) as ApiLot[];
    _lotsMemo.set(slug, { at: Date.now(), data });
    return data;
  } catch {
    return [];
  }
}
