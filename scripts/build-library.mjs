// Builds library/ from the extracted text in archive/baws-text/ (see scripts/extract-baws.py).
// library/volumes.json        — one entry per volume file, with its official source URL
// library/baws-en/<id>.jsonl  — one line per PDF page: {"p": pdfPage, "n": printedPage|null, "t": text}
// The library folder is committed so the website can be built anywhere without the large PDFs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'archive/baws-text');
const OUT = path.join(root, 'library/baws-en');
fs.mkdirSync(OUT, { recursive: true });

const MEA = 'https://www.mea.gov.in/images/CPV/';
const IA = 'https://archive.org/download/Dr.BabasahebAmbedkarWritingsAndSpeechespdfsAllVolumes/';

// Titles of Dr. Babasaheb Ambedkar: Writings and Speeches (BAWS), English edition.
const VOLUMES = [
  ['Volume1', 'volume-1', 'Vol. 1', 'Castes in India, Annihilation of Caste, Linguistic States and other essays'],
  ['Volume2', 'volume-2', 'Vol. 2', 'In the Bombay Legislature, with the Simon Commission and at the Round Table Conferences'],
  ['Volume3', 'volume-3', 'Vol. 3', 'Philosophy of Hinduism; Revolution and Counter-Revolution in Ancient India; Buddha or Karl Marx'],
  ['Volume4', 'volume-4', 'Vol. 4', 'Riddles in Hinduism'],
  ['Volume5', 'volume-5', 'Vol. 5', 'Essays on Untouchables and Untouchability'],
  ['Volume6', 'volume-6', 'Vol. 6', 'The Evolution of Provincial Finance in British India; The Problem of the Rupee; other economic writings'],
  ['Volume7', 'volume-7', 'Vol. 7', 'Who Were the Shudras?; The Untouchables'],
  ['Volume8', 'volume-8', 'Vol. 8', 'Pakistan or the Partition of India'],
  ['Volume9', 'volume-9', 'Vol. 9', 'What Congress and Gandhi Have Done to the Untouchables; Mr. Gandhi and the Emancipation of the Untouchables'],
  ['Volume10', 'volume-10', 'Vol. 10', "As Member of the Governor-General's Executive Council, 1942–46"],
  ['Volume11', 'volume-11', 'Vol. 11', 'The Buddha and His Dhamma'],
  ['Volume12', 'volume-12', 'Vol. 12', 'Unpublished writings; Ancient Indian Commerce; Notes on Laws; Waiting for a Visa; and more'],
  ['Volume13', 'volume-13', 'Vol. 13', 'The Principal Architect of the Constitution of India'],
  ['Volume14_Part_I', 'volume-14-part-1', 'Vol. 14, Part I', 'Dr. Ambedkar and the Hindu Code Bill', IA + 'Volume_14_01.pdf'],
  ['Volume14_Part_II', 'volume-14-part-2', 'Vol. 14, Part II', 'Dr. Ambedkar and the Hindu Code Bill', IA + 'Volume_14_02.pdf'],
  ['Volume15', 'volume-15', 'Vol. 15', "As Free India's First Law Minister and Member of Opposition in Parliament, 1947–1956"],
  ['Volume16', 'volume-16', 'Vol. 16', 'The Pali Grammar and Pali–English Dictionary', IA + 'Volume_16.pdf'],
  ['Volume17_Part_I', 'volume-17-part-1', 'Vol. 17, Part I', 'Dr. B. R. Ambedkar and His Egalitarian Revolution — Struggle for Human Rights'],
  ['Volume17_Part_II', 'volume-17-part-2', 'Vol. 17, Part II', 'Dr. B. R. Ambedkar and His Egalitarian Revolution — Socio-political and Religious Activities'],
  ['Volume17_Part_III', 'volume-17-part-3', 'Vol. 17, Part III', 'Dr. B. R. Ambedkar and His Egalitarian Revolution — Speeches'],
];

const junk = (line) => /^[A-Za-z]:\\/.test(line) || /\.indd\b/i.test(line) || /\\[^ ]*\\/.test(line);

function printedPage(lines) {
  for (const line of lines.slice(0, 2)) {
    const a = line.match(/^(\d{1,4})\s*\D/);
    const b = line.match(/\D\s*(\d{1,4})$/);
    const n = Number((a && a[1]) || (b && b[1]));
    if (n && n < 2500) return n;
  }
  return null;
}

const meta = [];
for (const [file, id, label, title, override] of VOLUMES) {
  const src = path.join(SRC, file + '.jsonl');
  if (!fs.existsSync(src)) { console.warn('missing', src); continue; }
  const rows = fs.readFileSync(src, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  let textPages = 0;
  const out = rows.map(({ page, text }) => {
    const lines = text.split('\n').filter((l) => !junk(l.trim()));
    const t = lines.join('\n').trim();
    if (t.length > 40) textPages++;
    return JSON.stringify({ p: page, n: printedPage(lines), t });
  });
  fs.writeFileSync(path.join(OUT, id + '.jsonl'), out.join('\n') + '\n');
  meta.push({
    id, label, title, file: `baws-en/${id}.jsonl`, pages: rows.length, textPages,
    sourceUrl: override || MEA + file + '.pdf',
    sourceName: override ? 'Internet Archive (OCR copy)' : 'Ministry of External Affairs, Government of India',
    officialUrl: MEA + file + '.pdf',
  });
  console.log(`${label.padEnd(18)} ${rows.length} pages, ${textPages} with text`);
}
fs.writeFileSync(path.join(root, 'library/volumes.json'), JSON.stringify(meta, null, 1));
console.log('volumes:', meta.length);
