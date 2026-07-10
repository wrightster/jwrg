// Single source of truth for office contact info, used in header,
// footer, contact page, etc.

import { counties as serviceAreaCounties } from './counties';

export const site = {
  name: 'Julie Wright Realty Group',
  shortName: 'Julie Wright Realty Group',
  // Canonical production origin (apex, no trailing slash) — the single source of
  // truth for the brand's stable identity URL: brokerage JSON-LD, robots.txt's
  // production gate, and the sitemap fallback all derive from it. Per-page
  // canonical/og URLs instead follow astro.config `site` (staging until launch),
  // which becomes this exact value at cutover so every host reference converges.
  url: 'https://juliewrightrealtygroup.com',
  description:
    'Five decades specializing in Triangle-area real estate — a full-service residential brokerage across the greater Triangle region and surrounding North Carolina counties.',
  phone: '(919) 847-7140',
  phoneRaw: '9198477140',
  fax: '(919) 847-7182',
  email: 'info@juliewrightrealtygroup.com',
  address: {
    street1: '10931 Strickland Rd',
    street2: 'Ste 111',
    city: 'Raleigh',
    state: 'NC',
    zip: '27615',
  },
  // Full service area (drives the JSON-LD areaServed block and the contact-page
  // county tags). Derived from src/data/counties.ts — the single source of truth,
  // also driving the About service-area map — so the two can never disagree.
  counties: serviceAreaCounties.map((c) => c.name.replace(/ County$/, '')),
  logoUrl: '/images/jwrg-logo.png',
  // Office embed-form tokens — paste from office.jwrgnc.com admin (Marketing →
  // Embed Forms). Empty strings mean "not yet wired"; pages render a phone/email
  // fallback instead of the embed script.
  formTokens: {
    contact: 'RRbsRCXeygIpq0Zxnhn6xfCFaD7wu0Pi',
    miniContact: '',
    testimonial: '',
    relocation: '',
    buyingGuide: '',
    cma: '',
    listYourHome: '',
    soldReport: '',
    listingInquiry: 'F7h6VKTWpW8J3GiytA38RsMuCXxJoHwD',
  },
};
