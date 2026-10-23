// Checks that a Marathi data file (src/data/mr/<name>.json) mirrors its English original exactly:
// the same keys, the same array lengths and order, and unchanged ids, links, dates, numbers and codes.
// Only human-readable text may differ.   Usage: node scripts/check-mr-json.mjs <name>
import fs from 'node:fs';

const name = process.argv[2];
const en = JSON.parse(fs.readFileSync(`src/data/${name}.json`, 'utf8'));
const mr = JSON.parse(fs.readFileSync(`src/data/mr/${name}.json`, 'utf8'));
const KEEP = new Set(['id', 'url', 'href', 'file', 'date', 'year', 'type', 'status', 'topics', 'tags', 'sources', 'source', 'sourceUrl', 'licenseUrl', 'license', 'width', 'height', 'volume', 'pages', 'category', 'slug', 'image', 'order', 'audioOrVideo', 'author']);
const CODE = /^(https?:\/\/\S+|\d{4}(-\d\d){0,2}|[\d.,–\- ]+|[a-z0-9]+(-[a-z0-9]+)*)$/;
const errs = [];
let translated = 0, texts = 0;

function walk(a, b, at, key) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return errs.push(`${at}: should be a list`);
    if (a.length !== b.length) return errs.push(`${at}: ${a.length} items in English, ${b.length} in Marathi`);
    return a.forEach((x, i) => walk(x, b[i], `${at}[${i}]`, key));
  }
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return errs.push(`${at}: should be an object`);
    const ka = Object.keys(a).join(','), kb = Object.keys(b).join(',');
    if (ka !== kb) errs.push(`${at}: keys differ (${ka} ≠ ${kb})`);
    for (const k of Object.keys(a)) walk(a[k], b[k], `${at}.${k}`, k);
    return;
  }
  if (typeof a === 'string') {
    if (a === '') { if (b !== '') errs.push(`${at}: empty in English, must stay empty`); return; }
    if (KEEP.has(key) || CODE.test(a)) { if (a !== b) errs.push(`${at}: must stay "${a.slice(0, 60)}"`); return; }
    if (typeof b !== 'string' || !b.trim()) return errs.push(`${at}: empty`);
    texts++;
    if (/[ऀ-ॿ]/.test(b)) translated++;
    else if (a.split(/\s+/).length > 4) errs.push(`${at}: not translated`);
    return;
  }
  if (a !== b) errs.push(`${at}: must stay ${JSON.stringify(a)}`);
}
walk(en, mr, name, '');
console.log(errs.length ? `✗ ${name}: ${errs.length} problem(s)\n  ${errs.slice(0, 40).join('\n  ')}` : `✓ ${name}: structure matches; ${translated} of ${texts} text fields in Marathi`);
process.exit(errs.length ? 1 : 0);
