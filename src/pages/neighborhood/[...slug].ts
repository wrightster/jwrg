import type { APIRoute } from 'astro';

// Legacy Dakno-era catch-all (singular /neighborhood/*). Matched subdivisions are
// 301'd to /neighborhoods/<slug> via astro.config `redirects`; everything else
// falls here to the neighborhoods index. See src/pages/staff/[...slug].ts for why
// this is a route file rather than a redirects-config entry.
export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect('/neighborhoods', 301);
