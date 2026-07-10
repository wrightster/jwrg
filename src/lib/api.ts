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
  normalizeListingLabel,
  type ApiListing,
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

  return listing ? normalizeListingLabel(listing) : null;
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
export interface ApiLot {
  id: string;
  lot_number: string;
  status: 'available' | 'reserved' | 'under_contract' | 'sold' | 'not_released' | 'common_area';
  lot_type: string | null;
  address: string | null;
  size_acres: number | string | null;
  size_sqft: number | string | null;
  base_price: number | string | null;
}

// Small in-process memo mirroring @jw/shared's cachedJson TTL (60s), so the
// neighborhoods index (one call per card) and the detail page don't re-hit the
// office for the same slug within a request burst. Keyed by slug.
const LOTS_TTL_MS = 60_000;
const _lotsMemo = new Map<string, { at: number; data: ApiLot[] }>();

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
