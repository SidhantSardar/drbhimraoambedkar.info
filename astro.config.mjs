// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSourceLinks from './src/plugins/rehype-source-links.mjs';
import rehypeChapterImages from './src/plugins/rehype-chapter-images.mjs';

// SITE_URL and BASE_PATH are set by the deploy workflow.
// Staging (GitHub Pages): https://sidhantsardar.github.io + /drbhimraoambedkar.info
// Production (own domain): https://drbhimraoambedkar.info + /
const site = process.env.SITE_URL || 'https://drbhimraoambedkar.info';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ rehypePlugins: [rehypeSourceLinks, rehypeChapterImages] }),
  },
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
