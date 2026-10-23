// Checks Marathi Markdown pages against their English originals: frontmatter parses and has the same keys,
// lists have the same length, dates and links are unchanged, every heading and source note is kept.
//   node scripts/check-mr-md.mjs src/content/mr/life/05-awakening.md [more files…]
import fs from 'node:fs';
import { parse } from 'yaml';

const split = (s) => {
  const m = s.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('no frontmatter');
  return { fm: parse(m[1]), body: m[2] };
};
const links = (s) => [...s.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
const heads = (s) => s.split('\n').filter((l) => /^#{1,6}\s/.test(l)).length;
let bad = 0;
for (const mrFile of process.argv.slice(2)) {
  const enFile = mrFile.replace('/mr/', '/');
  const errs = [];
  try {
    const en = split(fs.readFileSync(enFile, 'utf8'));
    const mr = split(fs.readFileSync(mrFile, 'utf8'));
    for (const k of Object.keys(en.fm)) {
      if (!(k in mr.fm)) { errs.push(`frontmatter: missing "${k}"`); continue; }
      if (Array.isArray(en.fm[k]) && en.fm[k].length !== (mr.fm[k] || []).length) errs.push(`frontmatter: "${k}" has ${en.fm[k].length} items in English, ${(mr.fm[k] || []).length} in Marathi`);
    }
    for (const k of ['order', 'heroImage']) if (en.fm[k] !== undefined && en.fm[k] !== mr.fm[k]) errs.push(`frontmatter: "${k}" must stay ${en.fm[k]}`);
    (en.fm.keyDates || []).forEach((d, i) => {
      const m = (mr.fm.keyDates || [])[i] || {};
      if (String(d.date) !== String(m.date) || (d.source || '') !== (m.source || '')) errs.push(`keyDates[${i}]: date and source must stay the same`);
    });
    const le = links(en.body), lm = links(mr.body);
    if (le.join() !== lm.join()) errs.push(`body links: ${le.length} in English, ${lm.length} in Marathi${le.length === lm.length ? ' (order or URLs differ)' : ''}`);
    const se = (en.body.match(/\[source:/gi) || []).length, sm = (mr.body.match(/\[(source|संदर्भ):/gi) || []).length;
    if (se !== sm) errs.push(`source notes: ${se} in English, ${sm} in Marathi`);
    if (heads(en.body) !== heads(mr.body)) errs.push(`headings: ${heads(en.body)} in English, ${heads(mr.body)} in Marathi`);
    const dev = (mr.body.match(/[ऀ-ॿ]/g) || []).length, lat = (mr.body.replace(/\]\([^)]*\)/g, '').match(/[A-Za-z]/g) || []).length;
    if (dev < lat) errs.push(`body looks mostly untranslated (${dev} Devanagari vs ${lat} Latin letters)`);
  } catch (e) { errs.push(e.message); }
  if (errs.length) bad++;
  console.log(errs.length ? `✗ ${mrFile}\n  ${errs.join('\n  ')}` : `✓ ${mrFile}`);
}
process.exit(bad ? 1 : 0);
