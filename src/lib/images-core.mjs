// Shared image helpers used by both Astro pages and the Markdown (rehype) plugins.
// Plain JS so the Markdown pipeline can import it without TypeScript.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const IMAGES = path.join(root, 'src/data/images.json');
const VARIANTS = path.join(root, 'src/data/image-variants.json');

let cache = { mtime: 0, images: [] };
let vcache = { mtime: 0, variants: {} };

export function base() {
  const b = process.env.BASE_PATH || '/';
  return b.endsWith('/') ? b : b + '/';
}

export function withBase(p) {
  if (!p || /^https?:\/\//.test(p)) return p;
  return base() + p.replace(/^\//, '');
}

export function loadImages() {
  try {
    const { mtimeMs } = fs.statSync(IMAGES);
    if (mtimeMs !== cache.mtime) cache = { mtime: mtimeMs, images: JSON.parse(fs.readFileSync(IMAGES, 'utf8')) };
  } catch {
    cache = { mtime: 0, images: [] };
  }
  return cache.images;
}

let mrCache = { mtime: 0, byId: new Map() };
/** The same photograph with its Marathi title and caption (src/data/mr/images.json), when there is one. */
export function inLang(img, lang) {
  if (!img || lang !== 'mr') return img;
  try {
    const f = path.join(root, 'src/data/mr/images.json');
    const { mtimeMs } = fs.statSync(f);
    if (mtimeMs !== mrCache.mtime) mrCache = { mtime: mtimeMs, byId: new Map(JSON.parse(fs.readFileSync(f, 'utf8')).map((i) => [i.id, i])) };
  } catch {
    return img;
  }
  const m = mrCache.byId.get(img.id);
  return m ? { ...img, title: m.title, caption: m.caption, place: m.place, people: m.people, sourceName: m.sourceName } : img;
}

export function loadVariants() {
  try {
    const { mtimeMs } = fs.statSync(VARIANTS);
    if (mtimeMs !== vcache.mtime) vcache = { mtime: mtimeMs, variants: JSON.parse(fs.readFileSync(VARIANTS, 'utf8')) };
  } catch {
    vcache = { mtime: 0, variants: {} };
  }
  return vcache.variants;
}

/** src / srcset for an images.json entry. Variants are made by scripts/build-images.mjs. */
export function imageSources(img) {
  const name = path.basename(img.file).replace(/\.[^.]+$/, '');
  const widths = loadVariants()[name] || [];
  const srcset = widths.map((w) => `${withBase(`/images/r/${name}-${w}.webp`)} ${w}w`).join(', ');
  return { src: withBase(img.file), srcset, width: img.width || undefined, height: img.height || undefined };
}

/** Images for a chapter/theme slug: historical photos first, contextual (e.g. Unsplash) after. */
export function imagesFor(slug, limit = 12) {
  const all = loadImages().filter((i) => (i.tags || []).includes(slug) && !/\.svg$/i.test(i.file));
  const rank = (i) => ((i.tags || []).includes('context') || i.sourceName === 'Unsplash' ? 1 : 0);
  return all.sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

/** The best header image for a chapter: the largest historical photo with that tag. */
// Chosen cover photographs (real photos of Dr. Ambedkar where they exist).
const COVERS = {
  'school-years': 'young-ambedkar-1912',
  columbia: 'ambedkar-at-columbia-1913-1916',
  london: 'ambedkar-barrister-1922',
  awakening: 'ambedkar-nipani-1925',
  'round-table': 'ambedkar-returns-to-bombay-1932',
  politics: 'ambedkar-lawyer-portrait',
  constitution: 'presenting-draft-constitution-1949',
  'law-minister': 'ambedkar-portrait-classic',
  buddhism: 'babasaheb-maisaheb-deekshabhoomi-1956',
  'final-days': 'buddha-or-karl-marx-kathmandu-1956',
  legacy: 'statue-of-social-justice-vijayawada',
  'personal-life': 'ambedkar-family-rajgriha-1934',
  inspirations: 'ambedkar-reading-a-book',
};

export function heroFor(slug) {
  const chosen = COVERS[slug] && loadImages().find((i) => i.id === COVERS[slug]);
  if (chosen) return chosen;
  const pool = imagesFor(slug, 99);
  const historical = pool.filter((i) => !(i.tags || []).includes('context'));
  const list = historical.length ? historical : pool;
  return list.reduce((best, i) => (!best || (i.width || 0) * (i.height || 0) > (best.width || 0) * (best.height || 0) ? i : best), null);
}

// The home page's life-story slider uses original photographs of Dr. Ambedkar (or his family) for
// every chapter, even where the chapter page itself opens on a place or a memorial.
const ORIGINALS = {
  'before-birth': 'ramji-maloji-sakpal-father',
  childhood: 'ambedkar-as-young-student',
  legacy: 'ambedkar-portrait-navayan',
};
export function originalFor(slug) {
  return (ORIGINALS[slug] && loadImages().find((i) => i.id === ORIGINALS[slug])) || heroFor(slug);
}

export function credit(img) {
  const bits = [img.author && `Photo: ${img.author}`, img.license].filter(Boolean);
  return bits.join(' · ');
}
