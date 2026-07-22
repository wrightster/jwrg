import type { APIRoute } from 'astro';

// Legacy Dakno-era catch-all (old MLS-slug property detail pages). New listings
// use address slugs under /listings/<slug> with no 1:1 map from the old MLS ids,
// so send these to the full search. See src/pages/staff/[...slug].ts for why this
// is a route file rather than a redirects-config entry.
export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect('/search', 301);
