// Fetches the RSS feeds listed in src/data/news-feeds.json and writes src/data/news.json.
// Only headlines, dates, outlet names and links are stored — readers go to the publisher to read.
// Runs on a schedule in GitHub Actions (.github/workflows/news.yml).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const feeds = JSON.parse(fs.readFileSync(path.join(root, 'src/data/news-feeds.json'), 'utf8'));
const OUT = path.join(root, 'src/data/news.json');
const PER_FEED = 25;
const MAX_AGE_DAYS = 30;

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });
const text = (v) => (typeof v === 'object' && v !== null ? v['#text'] ?? '' : v ?? '').toString().trim();
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function read(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (drbhimraoambedkar.info news reader)' },
    redirect: 'follow',
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = parser.parse(await res.text());
  const items = [].concat(xml?.rss?.channel?.item || xml?.feed?.entry || []);
  return items.slice(0, PER_FEED).map((it) => {
    let title = strip(text(it.title));
    let source = text(it.source) || feed.name;
    // Google News puts " - Outlet" at the end of the title.
    if (feed.name === 'Google News' && source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const link = text(it.link?.['@href'] ? it.link['@href'] : it.link);
    const date = new Date(text(it.pubDate || it.published || it.updated || it['dc:date']));
    return { title, link, source, category: feed.category, date: isNaN(+date) ? null : date.toISOString() };
  });
}

const all = [];
for (const feed of feeds) {
  try {
    const items = await read(feed);
    all.push(...items);
    console.log(`${feed.name} (${feed.category}): ${items.length}`);
  } catch (err) {
    console.warn(`skip ${feed.name} ${feed.url}: ${err.message}`);
  }
}

const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
const seen = new Set();
const items = all
  .filter((i) => i.title && /^https?:\/\//.test(i.link) && (!i.date || +new Date(i.date) > cutoff))
  .filter((i) => {
    const k = i.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

if (items.length === 0 && fs.existsSync(OUT)) {
  console.warn('No items fetched; keeping the previous news.json');
} else {
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), items }, null, 1));
  console.log(`news.json: ${items.length} items`);
}
