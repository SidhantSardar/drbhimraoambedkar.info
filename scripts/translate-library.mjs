// Marathi translation of Dr. Babasaheb Ambedkar: Writings and Speeches, chapter by chapter.
//
//   node scripts/translate-library.mjs prep  <volume-id> [chapter-slug …]   write source files to archive/translate/in/
//   node scripts/translate-library.mjs merge [<volume-id>]                   check translations in archive/translate/out/ and add them to library/baws-mr/
//   node scripts/translate-library.mjs api   <volume-id> [chapter-slug …]   translate with Claude (needs ANTHROPIC_API_KEY), then merge
//   node scripts/translate-library.mjs assemble <volume-id> <chapter-slug>   join <slug>.part1.json, part2… (written in pieces) into <slug>.json and check it
//   node scripts/translate-library.mjs check <volume-id> <chapter-slug>      check one translation without publishing it
//   node scripts/translate-library.mjs status                               how much of each volume is translated
//   node scripts/translate-library.mjs todo [<volume-id>]                   chapters not yet translated (prepares their source files)
//   node scripts/translate-library.mjs align [<volume-id>] [--all]           pages whose Marathi does not line up with that PDF page's English
//   node scripts/translate-library.mjs breaks <volume-id> [--show <p>]       worksheets for published paragraphs still held whole across a page break (i18n/PAGE-BREAK-BRIEF.md)
//   node scripts/translate-library.mjs resplit <volume-id> [--dry]           move the end of each such paragraph to its own page, from the worksheet answers
//
// Each source file holds one reader chapter as aligned paragraphs: { vol, slug, title, pages: [{ p, blocks: [{ type, text }] }] }.
// A translation keeps exactly the same pages, the same number of blocks and the same block types, so every Marathi
// paragraph sits next to the English paragraph it translates. A paragraph that runs over a page break is translated
// whole, with the mark "[[page N]]" put where the printed page turns; merge splits it there, so that every page in
// library/baws-mr holds the translation of what that PDF page holds. Rules for translators: i18n/marathi-style-guide.md
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { volumes, leavesOf, pagesOf, chapterBlocks, formatPage, PAGE_MARK } from '../src/lib/library.ts';
const MARKS = new RegExp(PAGE_MARK.source, 'g');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(root, 'archive/translate/in');
const OUT = path.join(root, 'archive/translate/out');
const BREAKS = path.join(root, 'archive/translate/breaks');
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
      // The place where the printed page turns, inside a paragraph, must be marked in the Marathi too.
      const want = sb.text.match(MARKS) || [], got = text.match(MARKS) || [];
      if (want.join() !== got.join()) errs.push(`page ${sp.p} block ${j}: needs ${want.join(' ') || 'no page mark'} (found ${got.join(' ') || 'none'}) — put it where the English page turns`);
      else if (got.length && text.split(PAGE_MARK).some((s, k) => k % 2 === 0 && !s.trim())) errs.push(`page ${sp.p} block ${j}: ${got[0]} needs Marathi text on both sides`);
    });
  });
  return errs;
}

/**
 * A checked translation as published pages: each paragraph marked "[[page N]]" is split at the mark, and the part
 * after it becomes the first block of page N, so that every page holds what that PDF page holds.
 */
function splitAtMarks(pages) {
  const out = pages.map((pg) => ({ p: pg.p, blocks: pg.blocks.map((b) => ({ type: b.type, text: String(b.text).trim() })) }));
  for (let i = out.length - 1; i >= 0; i--) {
    const blocks = out[i].blocks, last = blocks[blocks.length - 1];
    if (!last || !PAGE_MARK.test(last.text)) continue;
    const [head, p, tail] = last.text.split(PAGE_MARK);
    if (out[i + 1]?.p !== Number(p)) throw new Error(`page ${out[i].p}: [[page ${p}]] does not lead to the next page`);
    last.text = head.trim();
    out[i + 1].blocks.unshift({ type: last.type, text: tail.trim() });
  }
  return out;
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
      for (const pg of splitAtMarks(tr.pages)) pages.set(pg.p, { p: pg.p, b: pg.blocks, by: tr.by || 'ai', slug });
      if (tr.summary) sums[slug] = String(tr.summary).trim();
      // A source prepared before page marks existed holds paragraphs whole across page breaks with nothing to split them at.
      const unmarked = src.pages.filter((pg, i) => i > 0 && !src.pages[i - 1].blocks.some((b) => PAGE_MARK.test(b.text))
        && pg.blocks.length < formatPage(pagesOf(volById(vid)).find((r) => r.p === pg.p)?.t || '').length);
      console.log(`✓ ${vid}/${slug}: ${tr.pages.length} pages${unmarked.length ? ` — ${unmarked.length} paragraph(s) still run over a page break (source prepared without page marks): run "breaks ${vid}" after merging` : ''}`);
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
A paragraph that runs over a page break contains the mark [[page N]] where the printed page turns. Keep that mark, exactly as written and exactly once, at the matching point in your Marathi: the Marathi before it must render the English before it, and the Marathi after it the English after it (guide, rule 8).
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

/* ---------- Page alignment: every Marathi page holds what that PDF page holds ---------- */
const words = (s) => (s.match(/\S+/g) || []).length;
const textOf = (blocks) => blocks.map((b) => b.text).join(' ');
const DISPLAY = new Set(['title', 'center', 'quote']);
function readLib(vid) {
  const f = path.join(LIB, `${vid}.jsonl`);
  if (!fs.existsSync(f)) return new Map();
  return new Map(fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => { const r = JSON.parse(l); return [r.p, r]; }));
}

/**
 * Pages whose Marathi does not cover the same text as the English of that PDF page: an empty page, a page much
 * shorter or longer than its English, or a different number of paragraphs. Marathi uses fewer words than English
 * (about 0.8 per English word), so each page is measured against the volume as a whole.
 */
function align(only, all) {
  let bad = 0;
  for (const vol of volumes()) {
    if (only && vol.id !== only) continue;
    const mr = readLib(vol.id);
    if (!mr.size) continue;
    const pages = pagesOf(vol).filter((r) => mr.has(r.p)).map((r) => {
      const en = formatPage(r.t), m = mr.get(r.p).b;
      return { p: r.p, en, m, e: words(textOf(en)), w: words(textOf(m)) };
    });
    const rate = pages.reduce((s, x) => s + x.w, 0) / Math.max(1, pages.reduce((s, x) => s + x.e, 0));
    const issues = [];
    for (const pg of pages) {
      const why = [];
      if (pg.e >= 20 && pg.w === 0) why.push('the Marathi page is empty');
      else if (pg.e === 0 && pg.w > 0) why.push('Marathi text on a page that is blank in English');
      else if (pg.e >= 150) {
        const r = pg.w / pg.e / rate;
        if (r < 0.6 || r > 1.6) why.push(`${Math.round(r * 100)}% of the expected length`);
      }
      // Display pages (title pages, epigraphs) may be grouped differently; paragraphs must match one for one.
      if (!pg.en.some((b) => DISPLAY.has(b.type)) && pg.w > 0) {
        if (pg.m.length !== pg.en.length) why.push(`${pg.en.length} paragraph(s) in English, ${pg.m.length} in Marathi`);
        else pg.en.forEach((b, j) => {
          const e = words(b.text);
          const r = words(pg.m[j].text) / Math.max(1, e) / rate;
          if (e >= 80 && (r < 0.5 || r > 2)) why.push(`paragraph ${j + 1}: ${Math.round(r * 100)}% of the expected length`);
        });
      }
      if (why.length) issues.push(`${vol.id} p${pg.p}  EN ${pg.e}w  MR ${pg.w}w  ${why.join('; ')}`);
    }
    bad += issues.length;
    console.log(`${issues.length ? '✗' : '✓'} ${vol.id}: ${pages.length} pages, ${issues.length} not lined up with the English (${rate.toFixed(2)} Marathi words per English word)`);
    for (const l of all ? issues : issues.slice(0, 30)) console.log('   ' + l);
    if (!all && issues.length > 30) console.log(`   … ${issues.length - 30} more (add --all)`);
  }
  process.exitCode = bad ? 1 : 0;
}

/**
 * Published paragraphs that still run over a page break (translated before page marks existed): page `to` has one
 * paragraph fewer than its English, because its first paragraph sits, translated, at the end of page `from`.
 */
function heldOver(vol) {
  const mr = readLib(vol.id), out = [];
  for (const leaf of leavesOf(vol)) {
    const rows = pagesOf(vol).filter((r) => r.p >= leaf.start && r.p <= leaf.end && mr.has(r.p));
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].p !== rows[i - 1].p + 1) continue;
      const en = formatPage(rows[i].t), prevEn = formatPage(rows[i - 1].t);
      const m = mr.get(rows[i].p).b, prev = mr.get(rows[i - 1].p).b;
      if (en.length - m.length !== 1 || en[0].type !== 'p' || !prev.length || prev[prev.length - 1].type !== 'p' || !prevEn.length) continue;
      out.push({ id: `${vol.id}:${rows[i].p}`, from: rows[i - 1].p, to: rows[i].p, a: prevEn[prevEn.length - 1].text, b: en[0].text, m: prev[prev.length - 1].text });
    }
  }
  return out;
}

const enSentences = (s) => s.split(/(?<=[.?!][”"’)]?)\s+(?=[“"‘(]?[A-Z0-9])/);
/** Where the page turns in the English, as a share of the paragraph. */
const shareOf = (it) => it.a.length / (it.a.length + 1 + it.b.length);
function worksheetItem(it, whole = false) {
  const tailOf = (s, n) => (s.length > n ? '…' + s.slice(s.indexOf(' ', s.length - n) + 1) : s);
  const headOf = (s, n) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s);
  const before = whole ? it.a : tailOf(enSentences(it.a).slice(-2).join(' '), 700);
  const after = whole ? it.b : headOf(enSentences(it.b).slice(0, 2).join(' '), 700);
  // Show the whole Marathi paragraph when it is short, otherwise about 700 characters each side of where the page probably turns.
  const est = Math.round(shareOf(it) * it.m.length);
  let mr = it.m;
  if (!whole && it.m.length > 1800) {
    const sentences = [...it.m.matchAll(/[^]*?(?:[.?!।][”"’)]?(?=\s)|$)/g)].filter((x) => x[0].trim());
    const keep = sentences.filter((x) => x.index + x[0].length >= est - 700 && x.index <= est + 700);
    const s = keep[0].index, e = keep[keep.length - 1].index + keep[keep.length - 1][0].length;
    mr = (s > 0 ? '… ' : '') + it.m.slice(s, e).trim() + (e < it.m.length ? ' …' : '');
  }
  return [
    `### ${it.id} — PDF p. ${it.from} → p. ${it.to}`,
    `English, end of p. ${it.from}:`, `> ${before}`,
    `English, start of p. ${it.to}:`, `> ${after}`,
    `Marathi paragraph${mr === it.m ? '' : ' (the part around the page break)'} — the English page turns ${Math.round(shareOf(it) * 100)}% of the way through:`,
    `> ${mr}`, '',
  ].join('\n');
}

/** Writes worksheets for choosing where each held-over paragraph splits; answers go next to them. */
function breaks(vol, args) {
  const items = heldOver(vol);
  const show = args.indexOf('--show');
  if (show >= 0) {
    const it = items.find((x) => x.to === Number(args[show + 1]));
    return console.log(it ? worksheetItem(it, true) : `No paragraph runs over into p. ${args[show + 1]}`);
  }
  const size = Number(args[args.indexOf('--size') + 1]) || 80;
  const dir = path.join(BREAKS, vol.id);
  fs.mkdirSync(dir, { recursive: true });
  const n = Math.ceil(items.length / size);
  for (let k = 0; k < n; k++) {
    const part = items.slice(Math.round((k * items.length) / n), Math.round(((k + 1) * items.length) / n));
    const name = `batch-${String(k + 1).padStart(2, '0')}`;
    fs.writeFileSync(path.join(dir, `${name}.md`), `# ${vol.id} ${name}: ${part.length} paragraphs that run over a page break\n\nAnswers: ${path.relative(root, path.join(dir, `${name}.answers.jsonl`))}\n\n${part.map((it) => worksheetItem(it)).join('\n')}`);
    console.log(`${path.relative(root, path.join(dir, `${name}.md`))}: ${part.length} (p. ${part[0].to}–${part[part.length - 1].to})`);
  }
  if (!items.length) console.log(`${vol.id}: no paragraph runs over a page break`);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/**
 * Splits each held-over paragraph where its answer says the page turns, and moves the rest to the top of the next
 * page. Every answer is { id, at: "<last Marathi words on the first page> | <first words on the next>", exact, note };
 * with nothing before the "|", the whole paragraph moves (its English on the first page has no translation, e.g. a stray "zz");
 * "at": null leaves the paragraph where it is.
 * Only where the text sits changes: the run of words in the volume must stay exactly the same, or nothing is written.
 */
function resplit(vol, dry) {
  const items = new Map(heldOver(vol).map((it) => [it.id, it]));
  const dir = path.join(BREAKS, vol.id);
  const answers = new Map(), problems = [], warnings = [], cuts = [], kept = [];
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => x.endsWith('.answers.jsonl')).sort() : []) {
    fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((l, i) => {
      if (!l.trim()) return;
      let a;
      try { a = JSON.parse(l); } catch (e) { return problems.push(`${f}:${i + 1}: not valid JSON (${e.message})`); }
      if (!items.has(a.id)) problems.push(`${f}:${i + 1}: ${a.id} is not a paragraph that runs over a page break (already split?)`);
      else if (answers.has(a.id)) problems.push(`${f}:${i + 1}: ${a.id} answered twice`);
      else answers.set(a.id, a);
    });
  }
  for (const [id, a] of answers) {
    const it = items.get(id);
    // "at": null — not a paragraph held over after all (e.g. the next page's extra English block is a stray "zz"): leave it.
    if (a.at === null) { kept.push(`${id}: left as it is — ${a.note || 'no reason given'}`); continue; }
    const bar = String(a.at || '').indexOf('|');
    const l = String(a.at || '').slice(0, bar).trim(), r = String(a.at || '').slice(bar + 1).trim();
    if (bar < 0 || !r) { problems.push(`${id}: "at" must be "<last words before> | <first words after>"`); continue; }
    const hits = l ? [...it.m.matchAll(new RegExp(`(?<!\\S)${escapeRe(l)}\\s+${escapeRe(r)}`, 'g'))] : it.m.startsWith(r) ? [{ index: 0 }] : [];
    if (hits.length !== 1) { problems.push(`${id}: "${a.at}" found ${hits.length} times in the Marathi paragraph — ${hits.length ? 'give more words' : 'copy the words exactly'}`); continue; }
    const at = hits[0].index + l.length;
    const head = it.m.slice(0, at).trim(), tail = it.m.slice(at).trim();
    const fe = shareOf(it), fm = head.length / (head.length + 1 + tail.length);
    if (Math.abs(fe - fm) > 0.15 && Math.abs(fe - fm) * it.m.length > 300) warnings.push(`${id}: the English turns ${Math.round(fe * 100)}% of the way through, this split ${Math.round(fm * 100)}% — check`);
    cuts.push({ it, head, tail });
  }
  const missing = [...items.keys()].filter((id) => !answers.has(id));
  for (const x of [...problems, ...warnings, ...kept]) console.log('   ' + x);
  console.log(`${vol.id}: ${items.size} paragraphs run over a page break; ${cuts.length} answered and found, ${kept.length} left as they are, ${problems.length} problem(s), ${warnings.length} to check, ${missing.length} without an answer${missing.length ? ` (${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ', …' : ''})` : ''}`);
  if (dry || problems.length || missing.length) { if (!dry) console.log('Nothing written.'); process.exitCode = problems.length || missing.length ? 1 : 0; return; }
  const mr = readLib(vol.id);
  const run = () => [...mr.values()].sort((x, y) => x.p - y.p).flatMap((r) => r.b.flatMap((b) => b.text.split(/\s+/).filter(Boolean))).join(' ');
  const before = run();
  for (const { it, head, tail } of cuts) {
    const from = mr.get(it.from).b, to = mr.get(it.to).b;
    if (head) from[from.length - 1] = { ...from[from.length - 1], text: head };
    else from.pop();
    to.unshift({ type: 'p', text: tail });
  }
  if (run() !== before) die('✗ The words would change: nothing written.');
  const file = path.join(LIB, `${vol.id}.jsonl`);
  fs.writeFileSync(file, [...mr.values()].sort((x, y) => x.p - y.p).map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log(`✓ ${path.relative(root, file)}: ${cuts.length} paragraphs split at their page breaks; the words are unchanged.`);
}

if (cmd === 'prep') prep(volById(volId), slugs);
else if (cmd === 'merge') merge(volId);
else if (cmd === 'status') status();
else if (cmd === 'todo') todo(volId);
else if (cmd === 'check') report(volId, slugs[0]);
else if (cmd === 'assemble') assemble(volId, slugs[0]);
else if (cmd === 'api') await api(volById(volId), slugs);
else if (cmd === 'align') align(volId && !volId.startsWith('--') ? volId : '', process.argv.includes('--all'));
else if (cmd === 'breaks') breaks(volById(volId), slugs);
else if (cmd === 'resplit') resplit(volById(volId), slugs.includes('--dry'));
else die('Usage: translate-library.mjs prep|merge|api|assemble|check|status|todo|align|breaks|resplit …');
