import type { APIRoute } from 'astro';
import {
  fetchAllListings,
  fetchNeighborhoodLots,
  fetchNeighborhoods,
  fetchTeam,
  lotHref,
} from '../lib/api';
import { site as siteData } from '../data/site';

// Dynamic sitemap. The standard @astrojs/sitemap integration can't see SSR
// routes, so we enumerate them from the live feed here, alongside the key
// static pages. URLs use the environment's own host (Astro.site), so a
// staging build emits staging URLs — which stay un-indexed because robots.txt
// disallows everything off-production (see robots.txt.ts).
//
// Keep STATIC_PATHS in step with src/pages/. Anything under a `[param]` route
// is enumerated from the API below instead.

const STATIC_PATHS = [
  '/',
  '/listings',
  '/search',
  '/neighborhoods',
  '/neighborhood-map',
  '/resources',
  '/resources/real-estate-101',
  '/resources/buyers',
  '/resources/buyers/buying-guide',
  '/resources/buyers/faq',
  '/resources/buyers/mortgage-calculator',
  '/resources/sellers',
  '/resources/sellers/home-value',
  '/resources/sellers/list-your-property',
  '/resources/sellers/neighborhood-sold-report',
  '/resources/sellers/staging-tips',
  '/resources/relocation',
  '/resources/relocation/relocation-package',
  '/resources/relocation/moving-tips',
  '/property-organizer',
  '/about',
  '/contact',
  '/privacy',
  '/accessibility',
];

// Listing statuses worth indexing — currently-marketed homes. Sold listings are
// excluded from the sitemap (their pages still resolve directly).
const INDEXABLE = new Set(['active', 'coming_soon', 'pending', 'under_contract']);

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.href ?? siteData.url).replace(/\/$/, '');

  // One backend hiccup shouldn't 500 the sitemap — each source degrades to
  // "no URLs from this section" on its own.
  const [listings, neighborhoods, team] = await Promise.all([
    fetchAllListings().catch(() => []),
    fetchNeighborhoods().catch(() => []),
    fetchTeam().catch(() => []),
  ]);

  // Homesite detail pages, one API call per neighborhood (memoized 60s in
  // fetchNeighborhoodLots, which already swallows its own errors). Common-area
  // parcels have no page — the lot route redirects them — so they're skipped,
  // matching the neighborhood page's own `displayLots` filter.
  const lotPaths = (
    await Promise.all(
      neighborhoods.map(async (n) =>
        (await fetchNeighborhoodLots(n.slug))
          .filter((l) => l.status !== 'common_area')
          .map((l) => lotHref(n.slug, l)),
      ),
    )
  ).flat();

  const paths = [
    ...STATIC_PATHS,
    ...neighborhoods.map((n) => `/neighborhoods/${n.slug}`),
    ...lotPaths,
    ...team.map((m) => `/about/team/${m.slug}`),
  ];

  const urls: { loc: string; lastmod?: string }[] = [
    ...paths.map((p) => ({ loc: `${origin}${p}` })),
    ...listings
      .filter((l) => INDEXABLE.has(l.status))
      .map((l) => ({
        loc: `${origin}/listings/${l.slug}`,
        lastmod: l.list_date ?? undefined,
      })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
