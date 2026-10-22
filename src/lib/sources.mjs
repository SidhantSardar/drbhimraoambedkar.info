// Maps links to Dr. Ambedkar's Writings and Speeches (official MEA PDFs and the Internet Archive copies of
// Vols. 14 and 16) to the matching page of this website's own library, so readers stay on the site.
import fs from 'node:fs';
import path from 'node:path';

const CHUNK = 5;
let vols = null;
function volumes() {
  if (!vols) {
    try { vols = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'library/volumes.json'), 'utf8')); } catch { vols = []; }
  }
  return vols;
}

const PARTS = { I: 1, II: 2, III: 3 };

/** Site path (without base) of the library page for a BAWS PDF link, or null. */
export function libraryPathFor(href = '') {
  let id = null;
  let m = href.match(/mea\.gov\.in\/images\/CPV\/Volume(\d+)(?:_Part_(I{1,3}))?\.pdf/i);
  if (m) id = `volume-${m[1]}${m[2] ? `-part-${PARTS[m[2].toUpperCase()]}` : ''}`;
  m = href.match(/AllVolumes\/Volume_(\d+)(?:_0?(\d))?\.pdf/i);
  if (!id && m) id = `volume-${Number(m[1])}${m[2] ? `-part-${m[2]}` : ''}`;
  if (!id) return null;
  const vol = volumes().find((v) => v.id === id);
  if (!vol) return null;
  const page = Number((href.match(/#page=(\d+)/) || [])[1]);
  if (!page) return `/library/${id}/`;
  const start = Math.floor((page - 1) / CHUNK) * CHUNK + 1;
  const end = Math.min(vol.pages, start + CHUNK - 1);
  return `/library/${id}/pages-${start}-${end}/#p${page}`;
}

export function hostOf(href = '') {
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch { return ''; }
}
