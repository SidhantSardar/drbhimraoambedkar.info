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

export function credit(img) {
  const bits = [img.author && `Photo: ${img.author}`, img.license].filter(Boolean);
  return bits.join(' · ');
}
