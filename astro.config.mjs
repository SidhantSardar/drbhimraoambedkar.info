// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSourceLinks from './src/plugins/rehype-source-links.mjs';
import rehypeChapterImages from './src/plugins/rehype-chapter-images.mjs';

// SITE_URL and BASE_PATH are set by the deploy workflow.
// Live (GitHub Pages, own domain): https://prabuddhapathak.com + /
const site = process.env.SITE_URL || 'https://prabuddhapathak.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // Pages that are not in the menu (chat, blog while news is off, the story) stay out of the sitemap; they are also noindex.
  integrations: [sitemap({ filter: (page) => !/^\/(mr\/)?(chat|blog|story)\//.test(new URL(page).pathname) })],
  markdown: {
    processor: unified({ rehypePlugins: [rehypeSourceLinks, rehypeChapterImages] }),
  },
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
