// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// NOTE: `site` must match the final production domain exactly.
// It drives canonical URLs, sitemap.xml and all absolute JSON-LD @id values.
export default defineConfig({
  site: 'https://shreehanumanjyothis.in',

  // One canonical URL shape, decided ONCE, before the first page ships.
  // (The PN Rao teardown showed what happens when two URL shapes go live at the same time.)
  trailingSlash: 'always',
  build: { format: 'directory' },

  integrations: [
    sitemap({
      // Legal/utility pages carry no search value.
      filter: (page) =>
        !page.includes('/privacy-policy/') &&
        !page.includes('/terms/') &&
        !page.includes('/404'),
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
