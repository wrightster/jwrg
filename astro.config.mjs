// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Origin where this build is served — used to build absolute canonical +
  // og:image URLs on prerendered pages (social crawlers reject relative paths).
  // Production domain (site promoted off the legacy Dakno host, 2026-07).
  site: 'https://juliewrightrealtygroup.com',
  output: 'server',
  // Redirects, two groups:
  //  (1) internal moves from the 2026 rebuild (Resources hub, Real Estate 101).
  //  (2) legacy Dakno-era juliewrightrealtygroup.com URLs -> new site, derived
  //      from the Wayback CDX inventory (123 pages) + office slug matching.
  // These live here (not in nginx) so they travel with the app across hosts —
  // Ploi/nginx today, Coolify/Traefik after cutover. String form = 301. Astro
  // route priority means the specific static keys win over the [...slug]
  // catch-alls, so matched staff/neighborhoods beat the fallbacks. Source of the
  // legacy set: deploy/jwrg-legacy-redirects.conf (kept for reference).
  redirects: {
    // (1) internal 2026-rebuild moves ---------------------------------------
    '/property-search': '/search',
    '/resources/buyers/real-estate-101': '/resources/real-estate-101',
    '/buyers/real-estate-101': '/resources/real-estate-101',
    '/buyers': '/resources/buyers',
    '/buyers/[...slug]': '/resources/buyers/[...slug]',
    '/sellers': '/resources/sellers',
    '/sellers/[...slug]': '/resources/sellers/[...slug]',
    '/relocation': '/resources/relocation',
    '/relocation/[...slug]': '/resources/relocation/[...slug]',

    // (2) legacy Dakno URLs -------------------------------------------------
    // home / about
    '/index.php': '/',
    '/jwrg.php': '/about',
    '/staff.php': '/about',
    '/testimonial.php': '/about',
    // buyers
    '/buyers.php': '/resources/buyers',
    '/buyers-faq.php': '/resources/buyers/faq',
    '/form-buying-guide.php': '/resources/buyers/buying-guide',
    '/mortgage.php': '/resources/buyers/mortgage-calculator',
    // sellers
    '/sellers.php': '/resources/sellers',
    '/sellers-ready.php': '/resources/sellers',
    '/sell-home': '/resources/sellers',
    '/ah_seller_form.php': '/resources/sellers',
    '/form-list-your-home.php': '/resources/sellers/list-your-property',
    '/form-list-your-home': '/resources/sellers/list-your-property',
    '/form-cma.php': '/resources/sellers/home-value',
    '/form-neighborhood-sold-report.php': '/resources/sellers/neighborhood-sold-report',
    // relocation
    '/relocation.php': '/resources/relocation',
    '/relocation-moving.php': '/resources/relocation/moving-tips',
    '/form-relocation.php': '/resources/relocation/relocation-package',
    // misc resources / contact / legal
    '/keyterms': '/resources/real-estate-101',
    '/contact.php': '/contact',
    '/form-mini-contact.php': '/contact',
    '/privacy.php': '/privacy',
    // neighborhoods / areas index
    '/neighborhood-results.php': '/neighborhoods',
    '/neighborhood.php': '/neighborhoods',
    '/area': '/neighborhoods',
    '/area.php': '/neighborhoods',
    '/area-neighborhood-map.php': '/neighborhood-map',
    // listings / search
    '/property-search.php': '/search',
    '/property-list.php': '/search',
    '/idx-search.php': '/search',
    '/our-properties': '/search',
    '/property-request-info.php': '/search',
    '/property-request-showing.php': '/search',
    '/property-rss.php': '/listings',
    // Preserve West one-offs
    '/preservedocumentation.php': '/neighborhoods/preserve-west',
    '/preservesummersale': '/neighborhoods/preserve-west',
    // team members matched to current office profiles
    '/staff/alex-bailey': '/about/team/alex-bailey',
    '/staff/ali-watts': '/about/team/ali-watts',
    '/staff/donna-saldo': '/about/team/donna-saldo',
    '/staff/donnasaldo': '/about/team/donna-saldo',
    '/staff/janelle-clark': '/about/team/janelle-clark',
    '/staff/janice-coleman': '/about/team/janice-coleman',
    '/staff/julie-wright': '/about/team/julie-wright',
    '/staff/lindsey-ewing': '/about/team/lindsey-ewing',
    '/staff/lisa-branch': '/about/team/lisa-branch',
    '/staff/mahnaz-valipour': '/about/team/mahnaz-valipour',
    '/staff/mary-ammons': '/about/team/mary-ammons',
    '/staff/meriashlen': '/about/team/meri-ashlen-bailey',
    '/staff/paulshort': '/about/team/paul-short',
    '/staff/phyllis-howard': '/about/team/phyllis-howard',
    '/staff/robertpowell': '/about/team/robert-powell',
    '/staff/shelley-mitchiner': '/about/team/shelley-mitchiner',
    // neighborhoods matched to live office neighborhoods
    '/neighborhood/BraggFarm': '/neighborhoods/bragg-farm',
    '/neighborhood/CannadyMillRdLots': '/neighborhoods/cannady-mill-rd-lots',
    '/neighborhood/Cedar_Knolls': '/neighborhoods/cedar-knolls',
    '/neighborhood/colvardfarms.php': '/neighborhoods/colvard-farms',
    '/neighborhood/Preserve_West': '/neighborhoods/preserve-west',
    '/neighborhood/woodlandpark.php': '/neighborhoods/woodland-park',
    // counties -> neighborhoods index (the granville-vs-wake page is hidden/WIP)
    '/area/Wake.php': '/neighborhoods',
    '/area/Granville.php': '/neighborhoods',
    // known dead MLS-detail pages
    '/mls-design.php': '/search',
    '/mls-more-info.php': '/search',
    '/mls-request-showing.php': '/search',
    // NOTE: prefix catch-alls (/staff/*, /neighborhood/*, /area/*, /property/*)
    // can't be dynamic keys here (Astro tries to prerender [...slug] sources and
    // fails getStaticPaths). They live in src/middleware.ts as prefix fallbacks.
  },
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});