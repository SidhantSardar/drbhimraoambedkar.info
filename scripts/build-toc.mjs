// Builds library/toc.json — the chapter structure of every Writings and Speeches volume — by reading
// each volume's printed CONTENTS pages and mapping the printed page numbers to PDF pages.
// Long chapters are split into readable parts. Volumes whose contents can't be read fall back to
// fixed page ranges, so every page of every volume is always reachable.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vols = JSON.parse(fs.readFileSync(path.join(root, 'library/volumes.json'), 'utf8'));
const MAX_PART = 24; // PDF pages per reading page
const FALLBACK = 20;

const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[–—]/g, '-').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 48).replace(/-$/, '') || 'section';
const isCaps = (s) => /[A-Z]/.test(s) && s === s.toUpperCase();
const titleCase = (s) => {
  if (!isCaps(s)) return s;
  const small = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'its', 'versus']);
  return s.toLowerCase().replace(/[a-z][a-z'’]*/g, (w, i) => (i > 0 && small.has(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .replace(/\b(Ii|Iii|Iv|Vi|Vii|Viii|Ix|Xi|Xii)\b/g, (m) => m.toUpperCase());
};
const clean = (s) => s.replace(/…/g, '...').replace(/(\s*\.\s*){2,}/g, ' ').replace(/\s+/g, ' ').replace(/^[\s.:–—-]+|[\s.:–—-]+$/g, '').trim();

let contentsEnd = 0; // last PDF page of the contents, set by contentsLines
function contentsLines(rows) {
  const first = rows.slice(0, 60).find((r) => /\bCONTENTS\b/.test(r.t));
  contentsEnd = 0;
  if (!first) return [];
  const lines = [];
  for (let p = first.p; p < first.p + 16 && p <= rows.length; p++) {
    const r = rows[p - 1];
    const ls = r.t.split('\n').map((l) => l.trim()).filter(Boolean);
    const numbered = ls.filter((l) => /\d{1,4}\s*$/.test(l)).length;
    if (p > first.p && numbered < 3) break;
    lines.push(...ls);
    contentsEnd = p;
  }
  return lines;
}

const JUNK_I = /TABLE OF|CO\s?NTENTS|^(\(\d+\)\s*)+$|^\(?[IVXLC]+\)$|BABASAHEB AMBEDKAR|WRITINGS AND SPEECHES|DISCOUNT POLICY|^(MESSAGE|PREFACE|FOREWORD)\s*\(?[ivxlc]*\)?$/i;
const JUNK = { test: (l) => JUNK_I.test(l) || /\s[ivx]{1,4}$/.test(l) || /^\(?[ivxlc]+\)?$/.test(l) };
const STOPW = new Set(['with', 'from', 'that', 'this', 'their', 'what', 'which', 'were', 'have', 'chapter', 'part', 'section', 'book', 'riddle']);
const words = (s) => s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3 && !STOPW.has(w));
// Find the PDF page (near the estimate) whose opening lines contain the chapter title.
function verify(e, rows) {
  const ws = words(e.title).slice(0, 5);
  if (ws.length < 2) return e.start;
  for (const d of [0, 1, -1, 2, -2, 3, -3]) {
    const r = rows[e.start - 1 + d];
    if (!r) continue;
    const top = r.t.slice(0, 700).toLowerCase().replace(/\s+/g, ' ');
    if (ws.filter((w) => top.includes(w)).length >= Math.ceil(ws.length * 0.6)) return r.p;
  }
  return null;
}

function parseEntries(lines) {
  const entries = [];
  let group = '';
  let expectGroupName = false;
  let buffer = [];
  for (const raw of lines) {
    const line = raw.replace(/…/g, '...').replace(/\s+/g, ' ').trim();
    if (/^(CONTENTS|PAGES?|Page|Pages|Sr\.?\s*No\.?.*|SUBJECT.*|Subject.*|No\.|Vol\.\s*\d+)$/i.test(line)) continue;
    if (/WRITINGS AND SPEECHES/i.test(line)) continue;
    const grp = line.match(/^(PART|SECTION|BOOK)\s+([IVXLC\d]+)\b\s*(.*)$/i);
    const tail = line.match(/^(.*?)[\s.·–—-]*?(\d{1,4})(?:\s*[-–—]\s*\d{1,4})?\s*$/);
    if (grp && !/\d\s*$/.test(line)) {
      group = titleCase(clean(`${grp[1]} ${grp[2]}`));
      if (grp[3]) group += ` — ${titleCase(clean(grp[3]))}`;
      expectGroupName = !grp[3];
      buffer = [];
      continue;
    }
    if (expectGroupName && !tail && isCaps(line) && line.length < 60) {
      group += ` — ${titleCase(clean(line))}`;
      expectGroupName = false;
      continue;
    }
    expectGroupName = false;
    if (!tail) {
      if (line.length > 2 && !JUNK.test(line)) buffer.push(line);
      if (buffer.length > 4) buffer.shift(); // titles wrap over a few lines at most
      continue;
    }
    let head = tail[1];
    if (JUNK.test(head)) { buffer = []; continue; }
    // A numbered entry ("2. Something 64") after loose lines: those lines finish the previous title.
    if (/^\(?\d{1,3}[.)]\s/.test(head) && buffer.length && entries.length) {
      entries[entries.length - 1].title = titleCase(clean(entries[entries.length - 1].title + ' ' + buffer.join(' ')));
      buffer = [];
    }
    const title = clean([...buffer, head].join(' '));
    buffer = [];
    if (!title || title.length < 3 || /^(section|part|book)$/i.test(title) || !/[A-Za-z]{3,}/.test(title)) continue;
    if (/Article\s+Page|\d+\s*[–-]\s*\d+.*\d+\s*[–-]\s*\d+|^\d+[-A-Z]*\s+\d+/.test(title)) continue;
    entries.push({ title: titleCase(title), group, printed: Number(tail[2]) });
  }
  // keep printed page numbers in order
  const out = [];
  for (const e of entries) if (!out.length || e.printed >= out[out.length - 1].printed) out.push(e);
  return out;
}

function pdfPageFor(printed, allRows, minPdf) {
  // only body pages (after the contents) carry reliable printed page numbers
  const rows = allRows.filter((r) => r.p > contentsEnd + 1);
  // the most common (PDF page − printed page) difference is the real offset; stray numbers are noise
  const mode = (a) => {
    const c = new Map();
    for (const x of a) c.set(x, (c.get(x) || 0) + 1);
    let best = 0, bestN = -1;
    for (const [x, k] of c) if (k > bestN) { best = x; bestN = k; }
    return best;
  };
  const offs = rows.filter((r) => r.n).map((r) => r.p - r.n);
  const near = rows.filter((r) => r.n && Math.abs(r.n - printed) <= 60).map((r) => r.p - r.n);
  const guess = printed + (near.length >= 4 ? mode(near) : mode(offs));
  const exact = rows.find((r) => r.n === printed && r.p >= minPdf && Math.abs(r.p - guess) <= 8);
  return exact ? exact.p : guess;
}

// A volume can hold more than one book (Vol. 7: Who Were the Shudras? and The Untouchables), and the
// volume's contents pages list only the first. A book from the works list that starts where no listed chapter
// does gets its own section, with its chapters read from the headings on its pages.
const works = JSON.parse(fs.readFileSync(path.join(root, 'src/data/works.json'), 'utf8'));
const volKey = (s) => 'volume-' + String(s).toLowerCase().replace(/\s*part\s*/, '-part-').replace(/\s+/g, '-');
const HEAD = /^(CHAPTER|PART|BOOK)\s+([IVXLC]+|\d+)\s*\.?$/i;
const SOLO = /^(PREFACE|INTRODUCTION|FOREWORD|PROLOGUE|EPILOGUE|CONCLUSION|APPENDIX(?:\s+[IVX\d]+)?)$/;
const capsLine = (s) => isCaps(s) && s.length < 90 && !/\.\s?\.\s*\d/.test(s);
function bookHeadings(rows, a, b, book) {
  const out = [];
  let part = '';
  for (const r of rows) {
    if (r.p < a || r.p > b) continue;
    const ls = r.t.split('\n').map((l) => l.trim()).filter(Boolean);
    if (ls.some((l) => /^CONTENTS$/i.test(l)) || ls.filter((l) => /\.\s?\.\s*\d+\s*$/.test(l)).length >= 2) continue; // the book's own contents
    for (let k = 0; k < ls.length; k++) {
      const m = ls[k].match(HEAD);
      if (m) {
        const t = [];
        for (const n of ls.slice(k + 1, k + 4)) { if (capsLine(n) && !HEAD.test(n)) t.push(n); else break; }
        const name = clean(t.join(' ').replace(/\s+[I1]$/, '').replace(/\s+([?.,])/g, '$1'));
        const label = `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2].toUpperCase()}`;
        if (/^(Part|Book)/i.test(m[1])) { part = name ? `${label} — ${titleCase(name)}` : label; continue; }
        out.push({ title: name ? `${label}. ${titleCase(name)}` : label, group: part ? `${book} · ${part}` : book, start: r.p });
      } else if (SOLO.test(ls[k]) && !out.some((o) => o.title.startsWith('Appendi') && /^APPENDIX/.test(ls[k]))) {
        out.push({ title: /^APPENDIX/.test(ls[k]) ? 'Appendices' : titleCase(ls[k]), group: part ? `${book} · ${part}` : book, start: r.p });
      }
    }
  }
  return out.filter((e, i, arr) => i === 0 || e.start !== arr[i - 1].start);
}
function addBooks(v, entries, rows) {
  for (const w of works) {
    for (const x of w.baws || []) {
      if (volKey(x.volume) !== v.id || !['book', 'thesis'].includes(w.type)) continue;
      const a = Number(String(x.url || '').match(/#page=(\d+)/)?.[1] || 0);
      const [p0, p1] = String(x.pages || '').split(/[–-]/).map(Number);
      if (!a || !p1 || p1 - p0 < 20) continue;
      if (!entries.length || entries.some((e) => Math.abs(e.start - a) <= 3) || a < entries[0].start) continue;
      const b = a + (p1 - p0);
      const book = w.title.replace(/\s*[:?].*$/, (m) => (m.startsWith('?') ? '?' : ''));
      const found = bookHeadings(rows, a, b, book);
      const inner = [{ title: 'Title pages and contents', group: book, start: a }, ...found.filter((e) => e.start > a)];
      const keep = entries.filter((e) => e.start < a || e.start > b);
      entries.splice(0, entries.length, ...[...keep, ...inner].sort((p, q) => p.start - q.start));
      console.log(`  + ${v.id}: "${book}" from PDF page ${a}, ${inner.length} sections`);
    }
  }
  return entries;
}

const toc = {};
for (const v of vols) {
  const rows = fs.readFileSync(path.join(root, 'library', v.file), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  let entries = parseEntries(contentsLines(rows));
  let minPdf = 1;
  entries = entries
    .map((e) => {
      const p = pdfPageFor(e.printed, rows, minPdf);
      if (p && p >= minPdf && p <= rows.length) minPdf = p;
      return { ...e, start: p };
    })
    .filter((e) => e.start && e.start >= 1 && e.start <= rows.length)
    .map((e) => ({ ...e, start: verify(e, rows) || e.start }));
  // keep a strictly increasing sequence of start pages
  entries = entries.filter((e, i, arr) => i === 0 || e.start > Math.max(...arr.slice(0, i).map((x) => x.start)));
  // merge entries that start on the same page (keep the first title)
  entries = entries.filter((e, i, arr) => i === 0 || e.start !== arr[i - 1].start);
  entries = addBooks(v, entries, rows);

  let sections;
  if (entries.length >= 3) {
    sections = [];
    if (entries[0].start > 1) sections.push({ title: 'Front matter', group: '', start: 1, end: entries[0].start - 1 });
    entries.forEach((e, i) => sections.push({ title: e.title, group: e.group, start: e.start, end: (entries[i + 1]?.start ?? rows.length + 1) - 1, printed: e.printed }));
  } else {
    sections = [];
    for (let s = 1; s <= rows.length; s += FALLBACK) sections.push({ title: `Pages ${s}–${Math.min(rows.length, s + FALLBACK - 1)}`, group: '', start: s, end: Math.min(rows.length, s + FALLBACK - 1) });
  }

  // reading pages: split long chapters into parts
  let n = 0;
  const chapters = sections.map((s) => {
    n += 1;
    const base = `${String(n).padStart(2, '0')}-${slugify(s.title)}`;
    const len = s.end - s.start + 1;
    const parts = [];
    if (len > MAX_PART) {
      const k = Math.ceil(len / MAX_PART);
      const size = Math.ceil(len / k);
      for (let i = 0; i < k; i++) {
        const a = s.start + i * size;
        const b = Math.min(s.end, a + size - 1);
        parts.push({ slug: `${base}-${i + 1}`, title: `Part ${i + 1}`, start: a, end: b });
      }
    } else parts.push({ slug: base, title: s.title, start: s.start, end: s.end });
    return { title: s.title, group: s.group, start: s.start, end: s.end, parts };
  });
  toc[v.id] = chapters;
  const leaves = chapters.reduce((t, c) => t + c.parts.length, 0);
  console.log(`${v.id.padEnd(18)} ${String(entries.length).padStart(3)} entries -> ${chapters.length} chapters, ${leaves} reading pages | ${chapters.slice(0, 4).map((c) => c.title.slice(0, 28)).join(' · ')}`);
}
fs.writeFileSync(path.join(root, 'library/toc.json'), JSON.stringify(toc, null, 1));
