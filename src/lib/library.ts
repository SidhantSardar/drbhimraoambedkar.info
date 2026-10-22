import fs from 'node:fs';
import path from 'node:path';

export type Volume = {
  id: string; label: string; title: string; file: string; pages: number; textPages: number;
  sourceUrl: string; sourceName: string; officialUrl: string;
};
export type Page = { p: number; n: number | null; t: string };
export type Part = { slug: string; title: string; start: number; end: number };
export type Chapter = { title: string; group: string; start: number; end: number; parts: Part[] };
/** One reading page of the documentation-style reader. */
export type Leaf = Part & { chapter: Chapter; chapterIndex: number; label: string };

const root = process.cwd();
let vols: Volume[] | null = null;
let tocData: Record<string, Chapter[]> | null = null;
const pageCache = new Map<string, Page[]>();

export function volumes(): Volume[] {
  if (!vols) {
    try { vols = JSON.parse(fs.readFileSync(path.join(root, 'library/volumes.json'), 'utf8')); } catch { vols = []; }
  }
  return vols!;
}

export function tocOf(vol: Volume): Chapter[] {
  if (!tocData) {
    try { tocData = JSON.parse(fs.readFileSync(path.join(root, 'library/toc.json'), 'utf8')); } catch { tocData = {}; }
  }
  return tocData![vol.id] || [];
}

export function leavesOf(vol: Volume): Leaf[] {
  return tocOf(vol).flatMap((c, ci) =>
    c.parts.map((p) => ({ ...p, chapter: c, chapterIndex: ci, label: c.parts.length > 1 ? `${c.title} — ${p.title}` : c.title })),
  );
}

/** The first reading page after the front matter. */
export function firstChapter(vol: Volume): Leaf | undefined {
  const leaves = leavesOf(vol);
  return leaves.find((l) => l.chapter.title !== 'Front matter') || leaves[0];
}

/** Reader page that contains a given PDF page. */
export function leafForPage(vol: Volume, page: number): Leaf | undefined {
  return leavesOf(vol).find((l) => page >= l.start && page <= l.end);
}

export function pagesOf(vol: Volume): Page[] {
  if (!pageCache.has(vol.id)) {
    const raw = fs.readFileSync(path.join(root, 'library', vol.file), 'utf8').trim().split('\n');
    pageCache.set(vol.id, raw.map((l) => JSON.parse(l)));
  }
  return pageCache.get(vol.id)!;
}

export const coverOf = (vol: Volume) => `/images/covers/${vol.id}.jpg`;

/* ---------- Turning a printed PDF page into readable text, word for word ---------- */
export type Block = { type: 'p' | 'h' | 'fn'; text: string };

const isRunningHeader = (l: string) => {
  const s = l.trim();
  if (!s) return false;
  if (/WRITINGS AND SPEECHES/i.test(s)) return true;
  const caps = s === s.toUpperCase() && /[A-Z]/.test(s);
  return caps && s.length < 90 && (/^\d{1,4}\s*\S/.test(s) || /\S\s*\d{1,4}$/.test(s));
};
const isHeading = (s: string) =>
  s.length > 2 && s.length < 80 && /[A-Z]/.test(s) && s === s.toUpperCase() && !/[.,;]$/.test(s) && !/^\d+$/.test(s);

/**
 * Re-flows one PDF page into paragraphs. Only line breaks, the running header and the page number
 * change: every word stays exactly as extracted from the official PDF.
 */
const FOOTNOTE = /^(\d{1,3}[.)]|\*+|†)\s*\S/;

export function formatPage(text: string): Block[] {
  let lines = text.split('\n').map((l) => l.replace(/\s+$/, ''));
  if (lines.length && isRunningHeader(lines[0])) lines.shift();
  if (lines.length && /^\s*\d{1,4}\s*$/.test(lines[0])) lines.shift();
  if (lines.length && /^\s*\d{1,4}\s*$/.test(lines[lines.length - 1])) lines.pop();
  const lens = lines.map((l) => l.trim().length).filter((n) => n > 25).sort((a, b) => a - b);
  const typical = lens.length ? lens[Math.floor(lens.length * 0.75)] : 70;
  const blocks: Block[] = [];
  let cur = '';
  const flush = () => { if (cur.trim()) blocks.push({ type: 'p', text: cur.trim() }); cur = ''; };
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flush(); continue; }
    if (isHeading(l) && !cur) {
      const prev = blocks[blocks.length - 1];
      if (prev && prev.type === 'h') prev.text += ' ' + l;
      else blocks.push({ type: 'h', text: l });
      continue;
    }
    // Numbered items and footnotes ("1. Ketkar, Caste, p. 4.", "* B.L.C. Debates…") start a new block.
    if (cur && FOOTNOTE.test(l)) flush();
    cur = cur ? `${cur} ${l}` : l;
    if (l.length < typical * 0.72 && /[.?!:;"”’)\]]$/.test(l)) flush();
  }
  flush();
  // Marked blocks at the very end of a page are its footnotes.
  for (let i = blocks.length - 1; i > 0 && blocks[i].type === 'p' && FOOTNOTE.test(blocks[i].text) && blocks[i].text.length < 400; i--) blocks[i].type = 'fn';
  return blocks;
}
