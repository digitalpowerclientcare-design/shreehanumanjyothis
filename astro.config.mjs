// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { redirectMap, redirects as redirectRules } from './src/data/redirects.ts';

// Redirect stubs must never appear in the sitemap — they are noindex meta-refresh
// pages, and listing them tells Google to crawl URLs we are trying to retire.
const redirectPaths = new Set(redirectRules.map((r) => r.from));

// NOTE: `site` must match the final production domain exactly.
// It drives canonical URLs, sitemap.xml and all absolute JSON-LD @id values.
export default defineConfig({
  site: 'https://shreehanumanjyothis.in',

  // One canonical URL shape, decided ONCE, before the first page ships.
  // (The PN Rao teardown showed what happens when two URL shapes go live at the same time.)
  trailingSlash: 'always',
  build: { format: 'directory' },

  // Old WordPress URLs → new pages. Astro emits a meta-refresh + canonical +
  // noindex stub for each in static mode. See src/data/redirects.ts.
  redirects: redirectMap,

  integrations: [
    sitemap({
      // Legal/utility pages carry no search value, and redirect stubs must be
      // excluded or we would be asking Google to crawl the URLs we are retiring.
      filter: (page) => {
        const path = new URL(page).pathname;
        if (redirectPaths.has(path)) return false;
        return (
          !page.includes('/privacy-policy/') &&
          !page.includes('/terms/') &&
          !page.includes('/404')
        );
      },
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  image: {
    // Keeps AVIF/WebP generation on for local assets.
    responsiveStyles: true,
  },
});
