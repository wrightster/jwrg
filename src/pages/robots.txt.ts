import type { APIRoute } from 'astro';

// Environment-aware robots.txt. Production (Astro.site === the real host) allows
// all crawlers and points to the sitemap; any non-production build (today JWRG
// is served from stage.jwrgnc.com) blocks everything so staging never gets
// indexed. Flips automatically when the launch switch repoints astro.config
// `site:` to the production host.

const PROD_HOST = 'juliewrightrealtygroup.com';

export const GET: APIRoute = ({ site }) => {
  const isProduction = site?.host === PROD_HOST;

  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: https://${PROD_HOST}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
