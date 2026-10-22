import fs from 'node:fs';
import path from 'node:path';

/** How many PDF pages are shown on one library web page. */
export const CHUNK = 5;

export type Volume = {
  id: string; label: string; title: string; file: string; pages: number; textPages: number;
  sourceUrl: string; sourceName: string; officialUrl: string;
};
export type Page = { p: number; n: number | null; t: string };

const root = process.cwd();
let vols: Volume[] | null = null;
const pageCache = new Map<string, Page[]>();

export function volumes(): Volume[] {
  if (!vols) {
    try {
      vols = JSON.parse(fs.readFileSync(path.join(root, 'library/volumes.json'), 'utf8'));
    } catch {
      vols = [];
    }
  }
  return vols!;
}

export function pagesOf(vol: Volume): Page[] {
  if (!pageCache.has(vol.id)) {
    const raw = fs.readFileSync(path.join(root, 'library', vol.file), 'utf8').trim().split('\n');
    pageCache.set(vol.id, raw.map((l) => JSON.parse(l)));
  }
  return pageCache.get(vol.id)!;
}

export const rangeSlug = (start: number, end: number) => `pages-${start}-${end}`;

export function chunksOf(vol: Volume) {
  const out: { start: number; end: number; slug: string }[] = [];
  for (let s = 1; s <= vol.pages; s += CHUNK) {
    const e = Math.min(vol.pages, s + CHUNK - 1);
    out.push({ start: s, end: e, slug: rangeSlug(s, e) });
  }
  return out;
}

/** Library web page that contains a given PDF page. */
export function chunkForPage(vol: Volume, page: number) {
  const start = Math.floor((page - 1) / CHUNK) * CHUNK + 1;
  return rangeSlug(start, Math.min(vol.pages, start + CHUNK - 1));
}
