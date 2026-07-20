import type { APIRoute } from 'astro';

// Liveness probe for the Coolify / Traefik health check.
// SSR (never prerendered) so a 200 means the Node server is actually handling
// requests — not just that a static file exists. Deliberately does NOT touch
// the office API: it checks *this* process, so upstream API latency can't make
// the container look unhealthy and get cycled.
export const prerender = false;

export const GET: APIRoute = () =>
  new Response('ok', {
    status: 200,
    headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
  });
