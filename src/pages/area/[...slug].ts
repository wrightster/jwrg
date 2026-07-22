import type { APIRoute } from 'astro';

// Legacy Dakno-era catch-all (singular /area/*, the old per-county pages). No new
// per-county pages exist (granville-vs-wake is WIP/hidden), so all county URLs go
// to the neighborhoods index. See src/pages/staff/[...slug].ts for the rationale.
export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect('/neighborhoods', 301);
