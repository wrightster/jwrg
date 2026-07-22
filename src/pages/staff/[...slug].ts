import type { APIRoute } from 'astro';

// Legacy Dakno-era catch-all. Specific old /staff/<slug> URLs that map to a
// current agent are 301'd via astro.config `redirects` (static keys win by route
// priority); every other /staff/* (departed agents, unknown slugs) lands here
// and goes to the team page. SSR (prerender=false) so it needs no getStaticPaths
// — which is why these fallbacks are route files, not `[...slug]` entries in the
// redirects config (those fail the static build).
export const prerender = false;

export const GET: APIRoute = ({ redirect }) => redirect('/about', 301);
