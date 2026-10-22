// Builds src/data/news.json from the feeds in src/data/news-feeds.json.
//
// 1. Reads every feed (headline, outlet, link, date, picture, snippet).
// 2. Groups reports of the same event into one "story", so a reader can see how local, national and
//    international outlets covered it.
// 3. If ANTHROPIC_API_KEY is set, writes a short neutral summary for each new story using only those
//    reports (cached in src/data/news-summaries.json so each story is summarised once).
// Articles are never copied: only headlines, short snippets, outlet names and links are stored.
// Runs every 6 hours in GitHub Actions (.github/workflows/news.yml).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const feeds = JSON.parse(fs.readFileSync(path.join(root, 'src/data/news-feeds.json'), 'utf8'));
const OUT = path.join(root, 'src/data/news.json');
const CACHE = path.join(root, 'src/data/news-summaries.json');
const PER_FEED = 25;
const MAX_AGE_DAYS = 30;
const MAX_STORIES = 120;
const SUMMARISE = 40; // newest stories that get an AI summary
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });
const text = (v) => (typeof v === 'object' && v !== null ? v['#text'] ?? '' : v ?? '').toString().trim();
const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

function imageOf(it) {
  const pick = (v) => (Array.isArray(v) ? v[0] : v);
  let u = text(it['News:Image']) || pick(it.enclosure)?.['@url'] || pick(it['media:content'])?.['@url'] || pick(it['media:thumbnail'])?.['@url'] || '';
  if (!u) {
    const html = text(it['content:encoded']) + ' ' + text(it.description);
    u = (html.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1] || '';
  }
  if (!u) return null;
  u = u.replace(/&amp;/g, '&').replace(/^http:\/\//, 'https://');
  if (/bing\.com\/th\?/.test(u)) u += '&w=640&h=400&c=7&rs=1';
  return /^https:\/\//.test(u) ? u : null;
}

async function read(feed) {
  const res = await fetch(feed.url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = parser.parse(await res.text());
  const items = [].concat(xml?.rss?.channel?.item || xml?.feed?.entry || []);
  return items.slice(0, PER_FEED).map((it) => {
    let title = strip(text(it.title));
    let outlet = text(it.source) || feed.name;
    if (feed.name === 'Google News' && outlet && title.endsWith(` - ${outlet}`)) title = title.slice(0, -(outlet.length + 3));
    if (it['News:Source']) outlet = text(it['News:Source']);
    let link = text(it.link?.['@href'] ? it.link['@href'] : it.link);
    const real = link.match(/[?&]url=([^&]+)/);
    if (real) link = decodeURIComponent(real[1]);
    const date = new Date(text(it.pubDate || it.published || it.updated || it['dc:date']));
    // Google's description only repeats the headline; other feeds give a short snippet.
    const snippet = feed.name === 'Google News' ? '' : strip(text(it.description) || text(it['content:encoded'])).slice(0, 400);
    return { title, outlet, link, category: feed.category, date: isNaN(+date) ? null : date.toISOString(), image: imageOf(it), snippet };
  });
}

// --- 1. read all feeds ---
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

// --- 2. group reports of the same event ---
const STOP = new Set('the a an and or of to in on for with at by from as is are was were be been has have had it its this that these those after before over into about amid against says said will would can could not new news india indian dalit dalits caste ambedkar babasaheb'.split(' '));
const words = (t) => new Set(t.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const similar = (a, b) => {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  const ratio = shared / Math.max(1, Math.min(a.size, b.size));
  return (shared >= 3 && ratio >= 0.45) || (shared >= 2 && ratio >= 0.67);
};

const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
const fresh = all.filter((i) => i.title && /^https?:\/\//.test(i.link) && (!i.date || +new Date(i.date) > cutoff));
fresh.sort((a, b) => String(b.date).localeCompare(String(a.date)));

const groups = [];
for (const item of fresh) {
  const w = words(item.title);
  let g = groups.find((s) => s.words.some((sw) => similar(w, sw)));
  if (!g) {
    g = { words: [], reports: [] };
    groups.push(g);
  }
  if (g.reports.some((r) => r.title.toLowerCase() === item.title.toLowerCase())) {
    // same headline from two feeds: keep the one with a picture
    const r = g.reports.find((x) => x.title.toLowerCase() === item.title.toLowerCase());
    if (!r.image && item.image) r.image = item.image;
    continue;
  }
  if (!g.words.length) g.words.push(w); // compare only with the story's first headline, so stories don't chain together
  g.reports.push(item);
}

const stories = groups.slice(0, MAX_STORIES).map((g) => {
  const lead = g.reports.find((r) => r.image) || g.reports[0];
  const id = crypto.createHash('sha1').update(g.reports.map((r) => r.link).sort()[0]).digest('hex').slice(0, 10);
  const counts = {};
  for (const r of g.reports) counts[r.category] = (counts[r.category] || 0) + 1;
  const category = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return {
    id,
    title: lead.title,
    category,
    image: lead.image || null,
    date: g.reports.map((r) => r.date).filter(Boolean).sort().pop() || null,
    outlets: [...new Set(g.reports.map((r) => r.outlet))],
    reports: g.reports.map(({ title, outlet, link, date, snippet }) => ({ title, outlet, link, date, snippet })),
  };
});

// --- 3. AI summaries (optional) ---
let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch {}

async function describe(link) {
  try {
    const res = await fetch(link, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!res.ok) return '';
    const html = (await res.text()).slice(0, 300000);
    const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:description|description)["']/i);
    return m ? strip(m[1]).slice(0, 500) : '';
  } catch {
    return '';
  }
}

if (process.env.ANTHROPIC_API_KEY) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  const SYSTEM = `You write short, neutral news briefs for drbhimraoambedkar.info, a public education website about Dr. B. R. Ambedkar, caste, social justice and the Constitution of India.

You are given one or more reports about one event: headline, outlet, date, and sometimes a short description. Using ONLY that material:
1. Explain in 2–3 short paragraphs of plain English what happened, where, and why it matters.
2. Say where the story appears to have started (place, and the local or regional outlets that reported it), and how national or international outlets covered it — only as far as the reports show.
3. If the reports disagree or the information is thin, say so plainly. Never add facts that are not in the reports. No opinions and no speculation.
Write plain paragraphs without headings or bullet points. Do not list the sources; the website lists them separately.`;
  const todo = stories.slice(0, SUMMARISE).filter((s) => !cache[s.id]);
  console.log(`summarising ${todo.length} new stories`);
  for (const s of todo) {
    const extra = await Promise.all(s.reports.map((r, i) => (i < 3 && !/news\.google\.com/.test(r.link) ? describe(r.link) : '')));
    const material = s.reports
      .map((r, i) => `[${i + 1}] ${r.outlet} — ${r.date ? r.date.slice(0, 10) : 'undated'}\nHeadline: ${r.title}${r.snippet ? `\nSnippet: ${r.snippet}` : ''}${extra[i] ? `\nDescription: ${extra[i]}` : ''}`)
      .join('\n\n');
    try {
      const msg = await client.beta.messages.create({
        model: process.env.NEWS_MODEL || 'claude-opus-5-5',
        max_tokens: 4000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: SYSTEM,
        messages: [{ role: 'user', content: `Reports about one event:\n\n${material}` }],
      });
      if (msg.stop_reason === 'refusal') continue;
      const summary = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
      if (summary) cache[s.id] = { summary, generated: new Date().toISOString() };
    } catch (err) {
      console.warn('summary failed', s.id, err?.status || err?.message);
    }
  }
  const live = new Set(stories.map((s) => s.id));
  for (const k of Object.keys(cache)) if (!live.has(k)) delete cache[k];
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
}
for (const s of stories) if (cache[s.id]) s.summary = cache[s.id].summary;

if (stories.length === 0 && fs.existsSync(OUT)) {
  console.warn('No stories fetched; keeping the previous news.json');
} else {
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), stories }, null, 1));
  console.log(`news.json: ${stories.length} stories from ${fresh.length} reports (${stories.filter((s) => s.summary).length} summarised)`);
}
