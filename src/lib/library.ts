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

/* ---------- Chapters as aligned paragraphs (the unit of translation) ---------- */
export type PageBlocks = { p: number; n: number | null; blocks: Block[] };

/**
 * The pages of a chapter as paragraphs, with a paragraph that runs over a page break kept whole on the
 * page where it starts, so that a translation can follow it sentence by sentence.
 */
export function chapterBlocks(rows: Page[]): PageBlocks[] {
  const out = rows.map((r) => ({ p: r.p, n: r.n, blocks: formatPage(r.t) }));
  for (let i = 0; i < out.length - 1; i++) {
    const last = out[i].blocks[out[i].blocks.length - 1];
    const next = out[i + 1].blocks[0];
    if (last && next && last.type === 'p' && next.type === 'p' && !/[.?!:"”’)\]]$/.test(last.text)) {
      last.text = `${last.text} ${next.text}`;
      out[i + 1].blocks.shift();
    }
  }
  return out;
}

/* ---------- Marathi translations (library/baws-mr) ---------- */
/** A translated page: its paragraphs, and who made the translation (e.g. "ai:claude (reviewed: no)"). */
export type MrPage = { b: Block[]; by?: string };
type MrVolume = { pages: Map<number, MrPage>; summaries: Record<string, string> };
const mrCache = new Map<string, MrVolume>();
let mrTitles: Record<string, Record<string, string>> | null = null;

export function marathiOf(vol: Volume): MrVolume {
  if (!mrCache.has(vol.id)) {
    const pages = new Map<number, MrPage>();
    let summaries: Record<string, string> = {};
    try {
      for (const l of fs.readFileSync(path.join(root, 'library/baws-mr', `${vol.id}.jsonl`), 'utf8').trim().split('\n')) {
        if (!l) continue;
        const r = JSON.parse(l);
        pages.set(r.p, { b: r.b, by: r.by });
      }
    } catch {}
    try { summaries = JSON.parse(fs.readFileSync(path.join(root, 'library/baws-mr', `${vol.id}.summaries.json`), 'utf8')); } catch {}
    mrCache.set(vol.id, { pages, summaries });
  }
  return mrCache.get(vol.id)!;
}

/** Marathi title of a volume, chapter or group heading, if one has been written. */
export function mrTitle(vol: Volume | string, title: string): string | undefined {
  if (!mrTitles) {
    try { mrTitles = JSON.parse(fs.readFileSync(path.join(root, 'library/toc-mr.json'), 'utf8')); } catch { mrTitles = {}; }
  }
  const id = typeof vol === 'string' ? vol : vol.id;
  return mrTitles![id]?.[title];
}

/* ---------- Names in the reader's language ---------- */
type L = 'en' | 'mr';
export const volLabelIn = (vol: Volume, lang: L) => (lang === 'mr' ? vol.label.replace('Vol.', 'खंड').replace('Part', 'भाग') : vol.label);
export const volTitleIn = (vol: Volume, lang: L) => (lang === 'mr' && mrTitle(vol, vol.title)) || vol.title;
/** Chapter, part or group title in the reader's language (falls back to English). */
export function titleIn(vol: Volume, title: string, lang: L): string {
  if (lang !== 'mr' || !title) return title;
  if (title === 'Front matter') return 'प्रारंभिक पाने';
  const part = title.match(/^Part (\d+)$/);
  if (part) return `भाग ${part[1]}`;
  const pages = title.match(/^Pages (\d+)[–-](\d+)$/);
  if (pages) return `पृष्ठे ${pages[1]}–${pages[2]}`;
  return mrTitle(vol, title) || title;
}
/** How many pages of a volume have a Marathi translation. */
export const translatedCount = (vol: Volume) => marathiOf(vol).pages.size;
/** Whether every page of a reading page (leaf) has been translated. */
export const leafTranslated = (vol: Volume, part: Part) => {
  const mr = marathiOf(vol).pages;
  for (let p = part.start; p <= part.end; p++) if (!mr.has(p)) return false;
  return true;
};
