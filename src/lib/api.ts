// Thin shim over @jw/shared/api — binds JWRG's site slug and re-exports
// everything else. Canonical source lives in packages/shared/src/api.ts.
// JWLC is the reference; if you're tempted to add logic here, add it there.

import {
  BASE_URL,
  fetchAllListings as sharedFetchAllListings,
  fetchListings as sharedFetchListings,
  fetchNeighborhoods as sharedFetchNeighborhoods,
  fetchTeam as sharedFetchTeam,
  fetchTeamMember as sharedFetchTeamMember,
  type ListingsQuery,
} from '@jw/shared/api';

export * from '@jw/shared/api';

export const SITE_SLUG = 'jwrg';

export const fetchListings = (q: ListingsQuery = {}) => sharedFetchListings(SITE_SLUG, q);
export const fetchAllListings = (q: ListingsQuery = {}) => sharedFetchAllListings(SITE_SLUG, q);
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

export async function fetchNeighborhoodLots(slug: string): Promise<ApiLot[]> {
  try {
    const res = await fetch(`${BASE_URL}/neighborhoods/${slug}/lots`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.data ?? []) as ApiLot[];
  } catch {
    return [];
  }
}
