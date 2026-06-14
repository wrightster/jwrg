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
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});