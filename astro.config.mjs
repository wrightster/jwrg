// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  // Origin where this build is served — used to build absolute canonical +
  // og:image URLs on prerendered pages (social crawlers reject relative paths).
  // Currently the staging host; switch to https://juliewrightrealtygroup.com
  // when the new site is promoted to production.
  site: 'https://stage.jwrgnc.com',
  output: 'server',
  // The old Dakno-era /property-search page was removed; send any lingering
  // links/bookmarks to /search — the full Triangle MLS search that replaced it
  // (the closest equivalent; /listings only shows our own listings).
  redirects: {
    '/property-search': '/search',
    // Buyers/Sellers/Relocation now live under the Resources hub (2026-07).
    // 301 the old top-level paths (and every deep page) to their new home.
    '/buyers': '/resources/buyers',
    '/buyers/[...slug]': '/resources/buyers/[...slug]',
    '/sellers': '/resources/sellers',
    '/sellers/[...slug]': '/resources/sellers/[...slug]',
    '/relocation': '/resources/relocation',
    '/relocation/[...slug]': '/resources/relocation/[...slug]',
  },
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});