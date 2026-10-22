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

// A thumbnail for the story: Bing's News:Image, an RSS enclosure/media tag, or the first <img> in the content.
function imageOf(it) {
  const pick = (v) => (Array.isArray(v) ? v[0] : v);
  let u = text(it['News:Image']) ||
    pick(it.enclosure)?.['@url'] || pick(it['media:content'])?.['@url'] || pick(it['media:thumbnail'])?.['@url'] || '';
  if (!u) {
    const html = text(it['content:encoded']) + ' ' + text(it.description);
    u = (html.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1] || '';
  }
  if (!u) return null;
  u = u.replace(/&amp;/g, '&').replace(/^http:\/\//, 'https://');
  if (/bing\.com\/th\?/.test(u)) u += '&w=320&h=220&c=7&rs=1';
  return /^https:\/\//.test(u) ? u : null;
}

async function read(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' },
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
    let link = text(it.link?.['@href'] ? it.link['@href'] : it.link);
    // Bing wraps the publisher's link; keep the real article URL.
    const real = link.match(/[?&]url=([^&]+)/);
    if (real) link = decodeURIComponent(real[1]);
    if (it['News:Source']) source = text(it['News:Source']);
    const date = new Date(text(it.pubDate || it.published || it.updated || it['dc:date']));
    return { title, link, source, category: feed.category, date: isNaN(+date) ? null : date.toISOString(), image: imageOf(it) };
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
// When the same story comes from two feeds, keep the copy that has a picture.
all.sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
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
