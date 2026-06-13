// Thin shim over @jw/shared/api — binds JWRG's site slug and re-exports
// everything else. Canonical source lives in packages/shared/src/api.ts.
// JWLC is the reference; if you're tempted to add logic here, add it there.

import {
  fetchAllListings as sharedFetchAllListings,
  fetchListings as sharedFetchListings,
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
