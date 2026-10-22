import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';

export async function GET(context) {
  const posts = (await getCollection('blog')).filter((p) => !p.data.draft).sort((a, b) => +b.data.date - +a.data.date);
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  return rss({
    title: `${SITE.name} — Blog`,
    description: SITE.description,
    site: context.site,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.date, link: `${base}blog/${p.id}/` })),
  });
}
