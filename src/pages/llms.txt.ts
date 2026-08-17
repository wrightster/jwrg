import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { fetchListings, fetchNeighborhoods } from '../lib/api';

// /llms.txt — markdown index for language models (llmstxt.org): the site's
// structure plus the live listing and neighborhood inventory, so a model can
// answer "what does JWRG have for sale?" without crawling every page.
//
// SSR, and every fetch is individually caught: a backend hiccup should thin
// this file, never 500 it.
export const prerender = false;

const BASE = site.url.replace(/\/$/, '');

const PAGES: Array<{ path: string; title: string; note: string }> = [
  { path: '/', title: 'Home', note: 'brokerage overview and featured listings' },
  { path: '/listings', title: 'Listings', note: 'every active residential listing, filterable by status, price, beds, and neighborhood' },
  { path: '/search', title: 'Property search', note: 'full Triangle MLS search (not limited to our listings)' },
  { path: '/neighborhoods', title: 'Neighborhoods', note: 'communities we represent, with available homesites and homes' },
  { path: '/neighborhood-map', title: 'Neighborhood map', note: 'interactive map of every neighborhood we represent' },
  { path: '/resources', title: 'Resources', note: 'buyer, seller, and relocation guides' },
  { path: '/resources/real-estate-101', title: 'Real estate 101', note: 'glossary of real estate terms' },
  { path: '/resources/buyers/mortgage-calculator', title: 'Mortgage calculator', note: 'monthly payment estimator' },
  { path: '/resources/sellers/home-value', title: 'Home value request', note: 'request a comparative market analysis' },
  { path: '/about', title: 'About', note: 'the brokerage, service area, and agent team' },
  { path: '/contact', title: 'Contact', note: 'phone, email, office address, and enquiry form' },
];

const money = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  const n = parseFloat(v);
  return Number.isNaN(n) || n <= 0 ? undefined : `$${Math.round(n).toLocaleString('en-US')}`;
};

export const GET: APIRoute = async () => {
  const [listings, neighborhoods] = await Promise.all([
    fetchListings().catch(() => []),
    fetchNeighborhoods().catch(() => []),
  ]);

  const out: string[] = [];
  out.push(`# ${site.name}`);
  out.push('');
  out.push(`> ${site.description}`);
  out.push('');
  out.push(
    `${site.name} is a full-service residential real estate brokerage in the greater Triangle region of North Carolina, ` +
      `serving ${site.counties.slice(0, 6).join(', ')} and surrounding counties. ` +
      `Listings and neighborhoods below are read live from our office system each time this file is requested, so they match the site.`,
  );
  out.push('');

  out.push('## Pages');
  out.push('');
  for (const p of PAGES) out.push(`- [${p.title}](${BASE}${p.path}): ${p.note}`);
  out.push('');

  if (listings.length) {
    out.push('## Current listings');
    out.push('');
    for (const l of listings) {
      const bits: string[] = [];
      if (l.status_label) bits.push(l.status_label.toLowerCase());
      const price = money(l.status === 'sold' ? (l.sold_price ?? l.list_price) : l.list_price);
      if (price) bits.push(price);
      if (l.bedrooms != null) bits.push(`${l.bedrooms} bd`);
      const baths = (l.bathrooms_full ?? 0) + (l.bathrooms_half ?? 0) * 0.5;
      if (baths) bits.push(`${baths} ba`);
      if (l.sqft != null) bits.push(`${l.sqft.toLocaleString('en-US')} sqft`);
      if (l.lot_size_acres) bits.push(`${l.lot_size_acres} acres`);
      const where = [l.city, l.state].filter(Boolean).join(', ');
      if (where) bits.push(where);
      const name = l.marketing_title || l.address || l.slug;
      out.push(`- [${name}](${BASE}/listings/${l.slug}): ${bits.join(', ')}`);
    }
    out.push('');
  }

  if (neighborhoods.length) {
    out.push('## Neighborhoods');
    out.push('');
    for (const n of neighborhoods) {
      const where = [n.city, n.state].filter(Boolean).join(', ');
      out.push(`- [${n.name}](${BASE}/neighborhoods/${n.slug})${where ? `: ${where}` : ''}`);
    }
    out.push('');
  }

  out.push('## Brokerage');
  out.push('');
  out.push(`- ${site.name} LLC — NC firm license C29156`);
  out.push(`- ${site.address.street1}, ${site.address.street2}, ${site.address.city}, ${site.address.state} ${site.address.zip}`);
  out.push(`- Phone: ${site.phone} · Email: ${site.email}`);
  out.push('- Sister brokerage for land and farm sales: [Julie Wright Land Company](https://juliewrightlandcompany.com)');
  out.push('');

  out.push('## Notes');
  out.push('');
  out.push('- Listing data is our own inventory, not the full MLS. Use the property search page for everything else on the market.');
  out.push('- Community microsites for individual neighborhoods are separate sites; each links from its neighborhood page here and serves its own /llms.txt.');
  out.push('');

  return new Response(out.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
