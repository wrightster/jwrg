import type { MiddlewareHandler } from 'astro';

// Short-lived edge/proxy caching for on-demand (SSR) responses.
//
// Every public page here is anonymous marketing content with no per-user state,
// so letting a CDN/reverse-proxy serve a cached copy for a minute — and a stale
// copy for a few more while it revalidates — takes the repeated render load off
// the single, memory-constrained droplet (see workspace CLAUDE.md → infra). The
// office API already has its own 60 s in-process memo; this caches the *rendered
// HTML* on top of that.
//
// Prerendered routes are static files and never reach this middleware, so they
// are unaffected. We only stamp successful HTML/XML responses that haven't
// already set their own Cache-Control, and never redirects/errors.
const CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const response = await next();

  // Legacy Dakno-era prefix fallbacks. Exact legacy URLs are 301'd during
  // routing via astro.config `redirects`; anything under these old path prefixes
  // that didn't match an exact rule lands here as a 404 — send it to the section
  // index instead of a dead end. Gated on 404 so real pages and the exact
  // redirects are never shadowed. (Mirrors the nginx map's regex fallbacks.)
  if (response.status === 404) {
    const p = context.url.pathname;
    const fallback =
      p.startsWith('/staff/') ? '/about'
      : p.startsWith('/neighborhood/') ? '/neighborhoods'
      : p.startsWith('/area/') ? '/neighborhoods'
      : p.startsWith('/property/') ? '/search'
      : p.startsWith('/mls') ? '/search'
      : null;
    if (fallback) return context.redirect(fallback, 301);
  }

  if (response.status !== 200 || response.headers.has('cache-control')) {
    return response;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/html') || contentType.includes('application/xml')) {
    response.headers.set('cache-control', CACHE_CONTROL);
  }

  return response;
};
