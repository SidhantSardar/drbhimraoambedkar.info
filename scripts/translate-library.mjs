// Marathi translation of Dr. Babasaheb Ambedkar: Writings and Speeches, chapter by chapter.
//
//   node scripts/translate-library.mjs prep  <volume-id> [chapter-slug …]   write source files to archive/translate/in/
//   node scripts/translate-library.mjs merge [<volume-id>]                   check translations in archive/translate/out/ and add them to library/baws-mr/
//   node scripts/translate-library.mjs api   <volume-id> [chapter-slug …]   translate with Claude (needs ANTHROPIC_API_KEY), then merge
//   node scripts/translate-library.mjs assemble <volume-id> <chapter-slug>   join <slug>.part1.json, part2… (written in pieces) into <slug>.json and check it
//   node scripts/translate-library.mjs check <volume-id> <chapter-slug>      check one translation without publishing it
//   node scripts/translate-library.mjs status                               how much of each volume is translated
//   node scripts/translate-library.mjs todo [<volume-id>]                   chapters not yet translated (prepares their source files)
//
// Each source file holds one reader chapter as aligned paragraphs: { vol, slug, title, pages: [{ p, blocks: [{ type, text }] }] }.
// A translation keeps exactly the same pages, the same number of blocks and the same block types, so every Marathi
// paragraph sits next to the English paragraph it translates. Rules for translators: i18n/marathi-style-guide.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { volumes, leavesOf, pagesOf, chapterBlocks } from '../src/lib/library.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(root, 'archive/translate/in');
const OUT = path.join(root, 'archive/translate/out');
const LIB = path.join(root, 'library/baws-mr');
const GUIDE = fs.readFileSync(path.join(root, 'i18n/marathi-style-guide.md'), 'utf8');

const [cmd, volId, ...slugs] = process.argv.slice(2);
const volById = (id) => volumes().find((v) => v.id === id) || die(`No volume "${id}"`);
function die(msg) { console.error(msg); process.exit(1); }

function sourceOf(vol, leaf) {
  const rows = pagesOf(vol).filter((r) => r.p >= leaf.start && r.p <= leaf.end);
  return { vol: vol.id, slug: leaf.slug, title: leaf.label, pages: chapterBlocks(rows).map(({ p, blocks }) => ({ p, blocks })) };
}

function prep(vol, wanted, quiet = false) {
  const leaves = leavesOf(vol).filter((l) => !wanted.length || wanted.includes(l.slug));
  fs.mkdirSync(path.join(IN, vol.id), { recursive: true });
  return leaves.map((leaf) => {
    const src = sourceOf(vol, leaf);
    fs.writeFileSync(path.join(IN, vol.id, `${leaf.slug}.json`), JSON.stringify(src, null, 1));
    const words = src.pages.reduce((s, pg) => s + pg.blocks.reduce((a, b) => a + b.text.split(/\s+/).length, 0), 0);
    if (!quiet) console.log(`${vol.id}/${leaf.slug}: ${src.pages.length} pages, ${words} words`);
    return { ...leaf, words };
  });
}

const DEVANAGARI = /[ऀ-ॿ]/g;
/** Problems with a translation, compared with its source. Empty when it can be published. */
function check(src, tr) {
  const errs = [];
  if (!tr || !Array.isArray(tr.pages)) return ['no pages'];
  if (tr.pages.length !== src.pages.length) errs.push(`expected ${src.pages.length} pages, got ${tr.pages.length}`);
  src.pages.forEach((sp, i) => {
    const tp = tr.pages[i];
    if (!tp || tp.p !== sp.p) return errs.push(`page ${sp.p}: missing or out of order`);
    if (tp.blocks.length !== sp.blocks.length) return errs.push(`page ${sp.p}: expected ${sp.blocks.length} blocks, got ${tp.blocks.length}`);
    sp.blocks.forEach((sb, j) => {
      const tb = tp.blocks[j];
      if (tb.type !== sb.type) errs.push(`page ${sp.p} block ${j}: type ${tb.type} should be ${sb.type}`);
      const text = String(tb.text || '').trim();
      if (!text) errs.push(`page ${sp.p} block ${j}: empty`);
      const letters = sb.text.replace(/[^A-Za-z]/g, '').length;
      // Mostly-English blocks (names, references, tables) may stay English; prose must be Marathi.
      if (letters > 120 && (text.match(DEVANAGARI) || []).length < letters * 0.35) errs.push(`page ${sp.p} block ${j}: not translated`);
      const ratio = text.length / Math.max(1, sb.text.length);
      if (sb.text.length > 200 && (ratio < 0.5 || ratio > 2.6)) errs.push(`page ${sp.p} block ${j}: length ${ratio.toFixed(2)}× the English — check nothing was dropped or added`);
    });
  });
  return errs;
}

function merge(onlyVol) {
  if (!fs.existsSync(OUT)) return console.log('Nothing to merge.');
  fs.mkdirSync(LIB, { recursive: true });
  for (const vid of fs.readdirSync(OUT)) {
    if (onlyVol && vid !== onlyVol) continue;
    const file = path.join(LIB, `${vid}.jsonl`);
    const sumFile = path.join(LIB, `${vid}.summaries.json`);
    const pages = new Map();
    if (fs.existsSync(file)) for (const l of fs.readFileSync(file, 'utf8').trim().split('\n')) if (l) { const r = JSON.parse(l); pages.set(r.p, r); }
    const sums = fs.existsSync(sumFile) ? JSON.parse(fs.readFileSync(sumFile, 'utf8')) : {};
    for (const f of fs.readdirSync(path.join(OUT, vid)).filter((x) => x.endsWith('.json') && !/\.part\d+\.json$/.test(x))) {
      const slug = f.replace(/\.json$/, '');
      const srcFile = path.join(IN, vid, f);
      if (!fs.existsSync(srcFile)) { console.log(`✗ ${vid}/${slug}: no source file (run prep)`); continue; }
      const src = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
      let tr;
      try { tr = JSON.parse(fs.readFileSync(path.join(OUT, vid, f), 'utf8')); } catch (e) { console.log(`✗ ${vid}/${slug}: invalid JSON (${e.message})`); continue; }
      const errs = check(src, tr);
      if (errs.length) { console.log(`✗ ${vid}/${slug}: ${errs.length} problem(s)\n   ${errs.slice(0, 8).join('\n   ')}`); continue; }
      for (const pg of tr.pages) pages.set(pg.p, { p: pg.p, b: pg.blocks.map((b) => ({ type: b.type, text: String(b.text).trim() })), by: tr.by || 'ai', slug });
      if (tr.summary) sums[slug] = String(tr.summary).trim();
      console.log(`✓ ${vid}/${slug}: ${tr.pages.length} pages`);
    }
    const sorted = [...pages.values()].sort((a, b) => a.p - b.p);
    fs.writeFileSync(file, sorted.map((r) => JSON.stringify(r)).join('\n') + '\n');
    fs.writeFileSync(sumFile, JSON.stringify(sums, null, 1) + '\n');
  }
}

function status() {
  let all = 0, done = 0;
  for (const v of volumes()) {
    const file = path.join(LIB, `${v.id}.jsonl`);
    const n = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).length : 0;
    all += v.pages; done += n;
    console.log(`${v.id.padEnd(18)} ${String(n).padStart(5)} / ${v.pages} pages`);
  }
  console.log(`total              ${String(done).padStart(5)} / ${all} pages (${((done / all) * 100).toFixed(1)}%)`);
}

/* ---------- Translation with the Claude API (Message Batches: half price, results within 24 h) ---------- */
const INSTRUCTIONS = `You translate Dr. B. R. Ambedkar's writings from English into Marathi for a free public website.
Follow the translation guide below exactly. Fidelity to his meaning, tone and argument comes before everything else.

You receive one chapter as JSON: { title, pages: [{ p, blocks: [{ type, text }] }] }.
Block types: "p" paragraph, "h" heading, "fn" footnote.
Return JSON only, no commentary, in this shape:
{ "title": "<Marathi title>", "summary": "<सोप्या शब्दांत: 3–5 plain Marathi sentences saying what this chapter says, with no opinions>", "pages": [{ "p": <same>, "blocks": [{ "type": <same>, "text": "<Marathi>" }] }] }
Keep every page and every block, in the same order, with the same type. Translate each block completely: never merge, split, drop or summarise blocks.
Blocks that are only names, references, numbers or table rows may be kept as they are.

--- TRANSLATION GUIDE ---
${GUIDE}`;

async function api(vol, wanted) {
  if (!process.env.ANTHROPIC_API_KEY) die('Set ANTHROPIC_API_KEY first.');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  const done = new Set(fs.existsSync(path.join(OUT, vol.id)) ? fs.readdirSync(path.join(OUT, vol.id)).map((f) => f.replace(/\.json$/, '')) : []);
  const leaves = prep(vol, wanted).filter((l) => !done.has(l.slug));
  if (!leaves.length) return merge(vol.id);
  const model = process.env.TRANSLATE_MODEL || 'claude-opus-5-5';
  const batch = await client.messages.batches.create({
    requests: leaves.map((leaf) => ({
      custom_id: leaf.slug,
      params: {
        model,
        max_tokens: 64000,
        system: [{ type: 'text', text: INSTRUCTIONS, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: fs.readFileSync(path.join(IN, vol.id, `${leaf.slug}.json`), 'utf8') }],
      },
    })),
  });
  console.log(`Batch ${batch.id}: ${leaves.length} chapters sent to ${model}. Waiting…`);
  let b = batch;
  while (b.processing_status !== 'ended') {
    await new Promise((r) => setTimeout(r, 60_000));
    b = await client.messages.batches.retrieve(batch.id);
    console.log(`  ${new Date().toISOString().slice(11, 16)} ${JSON.stringify(b.request_counts)}`);
  }
  fs.mkdirSync(path.join(OUT, vol.id), { recursive: true });
  for await (const res of await client.messages.batches.results(batch.id)) {
    if (res.result.type !== 'succeeded') { console.log(`✗ ${res.custom_id}: ${res.result.type}`); continue; }
    const text = res.result.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('');
    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    try {
      fs.writeFileSync(path.join(OUT, vol.id, `${res.custom_id}.json`), JSON.stringify({ ...JSON.parse(json), by: `ai:${model}` }, null, 1));
    } catch { console.log(`✗ ${res.custom_id}: reply was not valid JSON`); }
  }
  merge(vol.id);
}

function readSrc(vid, slug) {
  const f = path.join(IN, vid, `${slug}.json`);
  if (!fs.existsSync(f)) die(`No source file ${f} (run prep first)`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function report(vid, slug) {
  const src = readSrc(vid, slug);
  let tr;
  try { tr = JSON.parse(fs.readFileSync(path.join(OUT, vid, `${slug}.json`), 'utf8')); } catch (e) { die(`✗ ${slug}: ${e.message}`); }
  const errs = check(src, tr);
  console.log(errs.length ? `✗ ${slug}: ${errs.length} problem(s)\n   ${errs.join('\n   ')}` : `✓ ${slug}: ${tr.pages.length} pages, ready to publish`);
}
function assemble(vid, slug) {
  const dir = path.join(OUT, vid);
  const parts = fs.readdirSync(dir).filter((f) => f.startsWith(`${slug}.part`) && f.endsWith('.json'))
    .sort((a, b) => Number(a.match(/part(\d+)/)[1]) - Number(b.match(/part(\d+)/)[1]));
  if (!parts.length) die(`No ${slug}.part*.json files in ${dir}`);
  const out = { title: '', summary: '', by: 'ai:claude (reviewed: no)', pages: [] };
  for (const f of parts) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (j.title) out.title = j.title;
    if (j.summary) out.summary = j.summary;
    out.pages.push(...(j.pages || []));
  }
  out.pages.sort((a, b) => a.p - b.p);
  fs.writeFileSync(path.join(dir, `${slug}.json`), JSON.stringify(out, null, 1));
  report(vid, slug);
}

/** Chapters with no published translation and no finished translation waiting to be merged. */
function todo(only) {
  const rows = [];
  for (const vol of volumes()) {
    if (only && vol.id !== only) continue;
    const done = new Set(fs.existsSync(path.join(LIB, `${vol.id}.jsonl`)) ? fs.readFileSync(path.join(LIB, `${vol.id}.jsonl`), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l).p) : []);
    for (const leaf of leavesOf(vol)) {
      let complete = true;
      for (let p = leaf.start; p <= leaf.end; p++) if (!done.has(p)) complete = false;
      if (complete || fs.existsSync(path.join(OUT, vol.id, `${leaf.slug}.json`))) continue;
      const src = prep(vol, [leaf.slug], true)[0];
      rows.push({ vol: vol.id, slug: leaf.slug, pages: leaf.end - leaf.start + 1, words: src.words });
    }
  }
  for (const r of rows) console.log(`${r.vol} ${r.slug} ${r.pages}p ${r.words}w`);
  console.log(`${rows.length} chapters, ${rows.reduce((s, r) => s + r.words, 0)} words to translate`);
}

if (cmd === 'prep') prep(volById(volId), slugs);
else if (cmd === 'merge') merge(volId);
else if (cmd === 'status') status();
else if (cmd === 'todo') todo(volId);
else if (cmd === 'check') report(volId, slugs[0]);
else if (cmd === 'assemble') assemble(volId, slugs[0]);
else if (cmd === 'api') await api(volById(volId), slugs);
else die('Usage: translate-library.mjs prep|merge|api|status …');
