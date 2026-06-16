import type { APIRoute } from 'astro';
import { fetchAllListings } from '../lib/api';

// Dynamic sitemap. The standard @astrojs/sitemap integration can't see SSR
// listing routes, so we enumerate them from the live feed here, alongside the
// key static pages. URLs use the environment's own host (Astro.site), so a
// staging build emits staging URLs — which stay un-indexed because robots.txt
// disallows everything off-production (see robots.txt.ts).

const STATIC_PATHS = [
  '/',
  '/listings',
  '/neighborhoods',
  '/buyers',
  '/sellers',
  '/relocation',
  '/about',
  '/about/team',
  '/testimonials',
  '/contact',
];

// Listing statuses worth indexing — currently-marketed homes. Sold listings are
// excluded from the sitemap (their pages still resolve directly).
const INDEXABLE = new Set(['active', 'coming_soon', 'pending', 'under_contract']);

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.href ?? 'https://juliewrightrealtygroup.com/').replace(/\/$/, '');

  const listings = (await fetchAllListings().catch(() => [])).filter((l) => INDEXABLE.has(l.status));

  const urls: { loc: string; lastmod?: string }[] = [
    ...STATIC_PATHS.map((p) => ({ loc: `${origin}${p}` })),
    ...listings.map((l) => ({
      loc: `${origin}/listings/${l.slug}`,
      lastmod: l.list_date ?? undefined,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
