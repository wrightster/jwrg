import type { APIRoute } from 'astro';
import { BASE_URL } from '../../lib/api';

// Same-origin document proxy backing the DocumentViewerModal's PDF.js viewer.
//
// The office serves document bytes at office.jwrgnc.com, but PDF.js's viewer
// refuses to load a file from a different origin than the viewer itself (and
// the office API sends no CORS headers) — so the modal points PDF.js here and
// this route streams the bytes from the office. `?inline=1` asks the office
// for an inline Content-Disposition; it only honors that for inline-safe mimes
// (pdf/image/video/audio) and forces a download for anything scriptable, so
// this proxy can't be used to serve HTML into our origin.
export const prerender = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  if (!UUID.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/documents/${id}?inline=1`);
  } catch {
    return new Response('Document temporarily unavailable', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  for (const name of ['content-type', 'content-length', 'content-disposition']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Documents change rarely; let the CDN/browser hold them briefly.
  headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=3600');

  return new Response(upstream.body, { status: 200, headers });
};
