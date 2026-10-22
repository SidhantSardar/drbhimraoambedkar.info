// Maps links to Dr. Ambedkar's Writings and Speeches (official MEA PDFs and the Internet Archive copies of
// Vols. 14 and 16) to the matching chapter of this website's own reader, so readers stay on the site.
import fs from 'node:fs';
import path from 'node:path';

let vols = null;
let toc = null;
function load() {
  if (!vols) {
    try { vols = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'library/volumes.json'), 'utf8')); } catch { vols = []; }
    try { toc = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'library/toc.json'), 'utf8')); } catch { toc = {}; }
  }
}

const PARTS = { I: 1, II: 2, III: 3 };

/** Volume id (e.g. "volume-17-part-2") for a BAWS PDF link, or null. */
export function volumeIdFor(href = '') {
  let m = href.match(/mea\.gov\.in\/images\/CPV\/Volume(\d+)(?:_Part_(I{1,3}))?\.pdf/i);
  if (m) return `volume-${m[1]}${m[2] ? `-part-${PARTS[m[2].toUpperCase()]}` : ''}`;
  m = href.match(/AllVolumes\/Volume_(\d+)(?:_0?(\d))?\.pdf/i);
  if (m) return `volume-${Number(m[1])}${m[2] ? `-part-${m[2]}` : ''}`;
  return null;
}

/** Site path (without base) of the reader page that shows a given PDF page. */
export function readerPath(volId, page) {
  load();
  const chapters = toc[volId];
  if (!chapters) return null;
  if (!page) return `/library/${volId}/`;
  for (const c of chapters) for (const p of c.parts) if (page >= p.start && page <= p.end) return `/library/${volId}/${p.slug}/#p${page}`;
  return `/library/${volId}/`;
}

/** Site path (without base) of the reader page for a BAWS PDF link, or null. */
export function libraryPathFor(href = '') {
  const id = volumeIdFor(href);
  if (!id) return null;
  load();
  if (!vols.find((v) => v.id === id)) return null;
  const page = Number((href.match(/#page=(\d+)/) || [])[1]);
  return readerPath(id, page);
}

const ROMAN = ['', 'I', 'II', 'III'];
/** The old MEA links (/Images/attach/amb/Volume_01.pdf) are dead; point them at the working
 *  /images/CPV/ files. Their page numbers differ, so the #page anchor is dropped. */
export function fixBawsUrl(u = '') {
  const m = u.match(/attach\/amb\/Volume_(\d+)(?:_(\d+))?\.pdf/i);
  if (!m) return u;
  return `https://www.mea.gov.in/images/CPV/Volume${Number(m[1])}${m[2] ? `_Part_${ROMAN[Number(m[2])]}` : ''}.pdf`;
}

const rows = new Map();
function rowsOf(id) {
  if (!rows.has(id)) {
    let r = [];
    try { r = fs.readFileSync(path.join(process.cwd(), `library/baws-en/${id}.jsonl`), 'utf8').trim().split('\n').map((l) => JSON.parse(l)); } catch {}
    rows.set(id, r);
  }
  return rows.get(id);
}

/** Volume id for a work's Writings and Speeches reference ({ volume, pages, url }), or null. */
export function bawsVolumeId(b = {}) {
  load();
  const v = String(b.volume ?? '').trim();
  const id = volumeIdFor(fixBawsUrl(b.url)) ?? (/^\d+$/.test(v) ? `volume-${v}` : null);
  return vols.some((x) => x.id === id) ? id : null;
}

/** Reader path (without base) for a work's Writings and Speeches reference, opening at its first page. */
export function bawsReaderPath(b = {}) {
  const id = bawsVolumeId(b);
  if (!id) return null;
  const vol = vols.find((x) => x.id === id);
  const printed = Number(String(b.pages ?? '').match(/\d+/)?.[0]);
  // Vols. 14 and 16 are read from the Internet Archive copy, whose PDF pages are numbered differently
  // from the official file the #page anchor points into, so use the printed page number there.
  if (vol.sourceUrl !== vol.officialUrl && printed) {
    const hit = rowsOf(id).find((r) => r.n != null && r.n >= printed);
    if (hit) return readerPath(id, Math.max(1, hit.p - (hit.n - printed)));
  }
  const page = Number((fixBawsUrl(b.url).match(/#page=(\d+)/) || [])[1]);
  return readerPath(id, page);
}

export function hostOf(href = '') {
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch { return ''; }
}
