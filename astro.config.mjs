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
  // links/bookmarks to the listings page (which now has keyword search).
  redirects: {
    '/property-search': '/listings',
  },
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});