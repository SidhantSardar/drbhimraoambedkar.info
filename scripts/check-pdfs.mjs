// Checks, before every build, that each reader page's PDF (public/pdf/<volume>/<slug>.pdf) exists and was
// split with the page range library/toc.json gives it now, as scripts/split-pdfs.py recorded in
// library/pdf-pages.json. A contents rebuilt without splitting again leaves the Official PDF view showing
// the wrong pages, or none.   Usage: node scripts/check-pdfs.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const vols = read('library/volumes.json');
const toc = read('library/toc.json');
const split = read('library/pdf-pages.json');
const errs = [], unused = [], resplit = new Set();
let n = 0;
for (const v of vols) {
  const dir = path.join(root, 'public/pdf', v.id);
  const slugs = new Set();
  for (const c of toc[v.id] || []) {
    for (const p of c.parts) {
      n++; slugs.add(p.slug);
      const at = `${v.id}/${p.slug}.pdf`, was = split[v.id]?.[p.slug];
      if (!fs.existsSync(path.join(dir, `${p.slug}.pdf`))) errs.push(`${at}: missing`);
      else if (!was) errs.push(`${at}: not in library/pdf-pages.json`);
      else if (was.start !== p.start || was.end !== p.end) errs.push(`${at}: has pages ${was.start}–${was.end}, the contents now say ${p.start}–${p.end}`);
      else continue;
      resplit.add(v.id);
    }
  }
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.pdf') && !slugs.has(f.slice(0, -4))) unused.push(`${v.id}/${f}`);
}
if (unused.length) console.log(`! chapter PDFs no reader page links to (deployed for nothing): ${unused.join(', ')}`);
if (errs.length) {
  console.log(`✗ chapter PDFs: ${errs.length} problem(s)\n  ${errs.slice(0, 40).join('\n  ')}\n  Split them again: .venv/bin/python -I scripts/split-pdfs.py ${[...resplit].join(' ')}`);
  process.exit(1);
}
console.log(`✓ chapter PDFs: all ${n} match library/toc.json`);
