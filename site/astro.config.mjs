// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://beaniestudio.site',
  integrations: [
    sitemap({
      // Utility pages are noindex — keep them out of the sitemap so crawlers
      // never see conflicting signals.
      filter: (page) => !page.includes('/404'),
    }),
  ],
  // Hover prefetch: internal navigations feel instant (huge for CWV-adjacent
  // engagement metrics). Links are prefetched only on hover/touch — no mass
  // bandwidth burn on mobile.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  vite: {
    // @ts-ignore — @tailwindcss/vite's Plugin type resolves against its own Vite
    // copy, not Astro's bundled one. Cosmetic type-skew only; build is unaffected.
    plugins: [tailwindcss()],
  },
  build: {
    // Inline all CSS into every page: eliminates a render-blocking request.
    // Correct tradeoff for a small stylesheet (~40KB) and mostly-static pages.
    inlineStylesheets: 'always',
  },
});
