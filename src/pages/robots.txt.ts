import type { APIRoute } from 'astro';
import { site as siteData } from '../data/site';

// Environment-aware robots.txt. Staging deployments (SITE_ENV=staging, set on
// the Coolify staging app) block every crawler so staging never gets indexed;
// production allows all and points to the sitemap. This endpoint is SSR, so
// SITE_ENV is read at request time — a runtime env var is enough (no rebuild).
// The host check is kept as a belt-and-suspenders fallback for any build served
// from a non-production host.

const PROD_HOST = new URL(siteData.url).host;

export const GET: APIRoute = ({ site }) => {
  const isStaging = process.env.SITE_ENV === 'staging';
  const isProduction = !isStaging && site?.host === PROD_HOST;

  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteData.url}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
