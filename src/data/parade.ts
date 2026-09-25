// Parade of Homes on JWRG (/parade). Driven by the office Parade model
// (APP-JWRG-0002, `GET /parades/{slug}`): the communities, their order, the
// entries and the public dates all come from the payload.
//
// The office slug of the parade this site shows.
export const PARADE_SLUG = 'parade-of-homes-2026';

// Fallback heading when the parade payload isn't available.
export const PARADE_TITLE = 'Parade of Homes 2026';

// Community microsites that have their own lot pages, by office neighborhood
// slug. A lot entry links to its page there; communities without a site get no
// link. Tennyson and Aubrie route lots on the plat lot number (`/lots/3`,
// `/homesites/3`), Preserve West likewise under `/lots/`.
const COMMUNITY_LOT_BASES: Record<string, string> = {
  'preserve-west': 'https://preservewest.jwrgnc.com/lots/',
  tennyson: 'https://tennyson.jwrgnc.com/lots/',
  'aubrie-place': 'https://aubrieplace.jwrgnc.com/homesites/',
};

export function communityLotUrl(neighborhoodSlug: string | null | undefined, lotNumber: string | null | undefined): string | null {
  const base = neighborhoodSlug ? COMMUNITY_LOT_BASES[neighborhoodSlug] : undefined;
  return base && lotNumber ? `${base}${encodeURIComponent(lotNumber)}` : null;
}
