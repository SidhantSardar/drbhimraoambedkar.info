// His flagship books as they sit inside the Writings and Speeches volumes: where each one starts and ends,
// and its own chapters, read from the headings on the printed pages (the volume contents do not always list them).
import { volumes, pagesOf, leafForPage, type Volume } from './library';
import { loadJSON } from './data';
import { url } from './site';

/** The books on the home shelf: id (as in works.json), title, Marathi title, year, one line, one line in Marathi. */
export const SHELF_BOOKS: [string, string, string, string, string, string][] = [
  ['annihilation-of-caste', 'Annihilation of Caste', 'जातिनिर्मूलन', '1936', 'The speech he was not allowed to give, so he printed it himself.', 'जे भाषण त्यांना देऊ दिले गेले नाही, ते त्यांनी स्वतः छापले.'],
  ['the-buddha-and-his-dhamma', 'The Buddha and His Dhamma', 'बुद्ध आणि त्यांचा धम्म', '1957', 'His last book: the life and teaching of the Buddha.', 'त्यांचा शेवटचा ग्रंथ: बुद्धांचे जीवन आणि शिकवण.'],
  ['who-were-the-shudras', 'Who Were the Shudras?', 'शूद्र पूर्वी कोण होते?', '1946', 'How the Shudras came to be the fourth varna.', 'शूद्र चौथा वर्ण कसे बनले.'],
  ['the-untouchables-who-were-they', 'The Untouchables', 'अस्पृश्य', '1948', 'Who the untouchables were, and how untouchability began.', 'अस्पृश्य कोण होते आणि अस्पृश्यता कशी सुरू झाली.'],
  ['pakistan-or-the-partition-of-india', 'Pakistan or the Partition of India', 'पाकिस्तान अथवा भारताची फाळणी', '1940', 'The case for and against partition, years before 1947.', '1947 च्या कितीतरी आधी फाळणीच्या बाजूचे आणि विरोधातले मुद्दे.'],
  ['what-congress-and-gandhi-have-done-to-the-untouchables', 'What Congress and Gandhi Have Done to the Untouchables', 'काँग्रेस आणि गांधी यांनी अस्पृश्यांचे काय केले', '1945', 'A record of how the untouchables were treated.', 'अस्पृश्यांना कशी वागणूक मिळाली याचा लेखाजोखा.'],
  ['problem-of-the-rupee', 'The Problem of the Rupee', 'रुपयाचा प्रश्न', '1923', 'His economics thesis on India’s currency.', 'भारतीय चलनावरील त्यांचा अर्थशास्त्रीय प्रबंध.'],
  ['evolution-of-provincial-finance', 'The Evolution of Provincial Finance in British India', 'ब्रिटिश भारतातील प्रांतिक वित्ताची उत्क्रांती', '1925', 'His Columbia doctorate on how British India was financed.', 'ब्रिटिश भारताच्या वित्तव्यवस्थेवरील त्यांचा कोलंबिया विद्यापीठातील डॉक्टरेट प्रबंध.'],
  ['castes-in-india', 'Castes in India', 'भारतातील जाती', '1916', 'His first paper, read at Columbia when he was 25.', 'वयाच्या 25व्या वर्षी कोलंबियात वाचलेला त्यांचा पहिला शोधनिबंध.'],
  ['states-and-minorities', 'States and Minorities', 'राज्ये आणि अल्पसंख्याक', '1947', 'A model constitution, with rights for every citizen.', 'प्रत्येक नागरिकाच्या हक्कांसह एका आदर्श संविधानाचा आराखडा.'],
  ['thoughts-on-linguistic-states', 'Thoughts on Linguistic States', 'भाषिक राज्यांविषयी विचार', '1955', 'How India’s states should be drawn by language.', 'भाषेनुसार राज्यांची रचना कशी असावी.'],
];

// Which printing each picture shows, so a later edition is never passed off as the first.
export const EDITION: Record<string, [string, string]> = {
  'annihilation-of-caste': ['Cover, first edition, 1936', 'मुखपृष्ठ, पहिली आवृत्ती, 1936'],
  'the-buddha-and-his-dhamma': ['Title page, first edition, 1957', 'शीर्षक पान, पहिली आवृत्ती, 1957'],
  'who-were-the-shudras': ['Title page, first edition, 1946', 'शीर्षक पान, पहिली आवृत्ती, 1946'],
  'the-untouchables-who-were-they': ['Title page, first edition, 1948', 'शीर्षक पान, पहिली आवृत्ती, 1948'],
  'pakistan-or-the-partition-of-india': ['Jacket, third edition, 1945', 'वेष्टन, तिसरी आवृत्ती, 1945'],
  'what-congress-and-gandhi-have-done-to-the-untouchables': ['Title page, first edition, 1945', 'शीर्षक पान, पहिली आवृत्ती, 1945'],
  'problem-of-the-rupee': ['Title page, first edition, 1923', 'शीर्षक पान, पहिली आवृत्ती, 1923'],
  'evolution-of-provincial-finance': ['Title page, first edition, 1925', 'शीर्षक पान, पहिली आवृत्ती, 1925'],
  'castes-in-india': ['First page, Indian Antiquary, May 1917', 'पहिले पान, इंडियन अँटिक्वेरी, मे 1917'],
  'states-and-minorities': ['Title page, first edition, 1947', 'शीर्षक पान, पहिली आवृत्ती, 1947'],
  'mooknayak': ['Front page, first issue, 1920', 'पहिले पान, पहिला अंक, 1920'],
  'bahishkrit-bharat': ['Front page, first issue, 1927', 'पहिले पान, पहिला अंक, 1927'],
  'prabuddha-bharat': ['Page one, special issue, 27 Oct 1956', 'पान एक, विशेष अंक, 27 ऑक्टोबर 1956'],
};

export type BookEntry = { label: string; title: string; page: number; printed: number | null; part?: string; href: string };
export type Book = { id: string; vol: Volume; start: number; end: number; printed: string; entries: BookEntry[]; work: any };

const volKey = (s: string) => 'volume-' + s.toLowerCase().replace(/\s*part\s*/, '-part-').replace(/\s+/g, '-');
const SMALL = /^(a|an|and|as|at|by|for|from|in|of|on|or|the|to|with)$/;
const tidy = (s: string) => s.toLowerCase().replace(/[a-z][a-z'’.]*/g, (w, i) => (i > 0 && SMALL.test(w) ? w : w[0].toUpperCase() + w.slice(1)));
const HEAD = /^(CHAPTER|PART|BOOK)\s+([IVXLC]+|\d+)\s*\.?$/i;
const SOLO = /^(PREFACE|INTRODUCTION|FOREWORD|PROLOGUE|EPILOGUE|CONCLUSION|APPENDIX(?:\s+[IVX\d]+)?)$/;
const upper = (s: string) => !!s && s === s.toUpperCase() && /[A-Z]/.test(s) && s.length < 90 && !/\.\.\s*\d/.test(s);

/** The book's place in its volume (PDF pages) and its chapters, or null if it is not in the 17 volumes. */
export function bookOf(id: string): Book | null {
  const work = loadJSON<any[]>('works', []).find((w) => w.id === id);
  const b = work?.baws?.[0];
  const vol = b ? volumes().find((v) => v.id === volKey(b.volume)) : undefined;
  if (!vol) return null;
  const ranges = (work.baws as any[]).filter((x) => volKey(x.volume) === vol.id).map((x) => {
    const start = Number(String(x.url).match(/#page=(\d+)/)?.[1] || 0);
    const [p0, p1] = String(x.pages).split(/[–-]/).map(Number);
    return { start, end: start + (p1 - p0), printed: x.pages as string };
  });
  const start = ranges[0].start, end = Math.max(...ranges.map((r) => r.end));
  const href = (page: number) => {
    const leaf = leafForPage(vol, page);
    return url(leaf ? `/library/${vol.id}/${leaf.slug}/#p${page}` : `/library/${vol.id}/`);
  };
  const found: BookEntry[] = [];
  let part = '';
  for (const r of pagesOf(vol)) {
    if (!ranges.some((x) => r.p >= x.start && r.p <= x.end)) continue;
    const lines = r.t.split('\n').map((l) => l.trim()).filter(Boolean);
    // skip the book's own contents pages (a CONTENTS title or dotted leaders to page numbers)
    if (lines.some((l) => /^CONTENTS$/i.test(l)) || lines.filter((l) => /\.\s?\.\s*\d+\s*$/.test(l)).length >= 2) continue;
    const here: BookEntry[] = [];
    lines.forEach((l, k) => {
      const m = l.match(HEAD);
      if (m) {
        const title: string[] = [];
        for (const n of lines.slice(k + 1, k + 4)) { if (upper(n) && !HEAD.test(n)) title.push(n); else break; }
        const text = title.join(' ').replace(/\s+[I1]$/, '').replace(/\s+([?.,])/g, '$1');
        here.push({ label: tidy(`${m[1]} ${m[2]}`).replace(/\b([ivxlc]+)$/i, (x) => x.toUpperCase()), title: text ? tidy(text) : '', page: r.p, printed: r.n, href: href(r.p) });
      } else if (SOLO.test(l)) here.push({ label: tidy(l).replace(/\b([ivxlc]+)$/i, (x) => x.toUpperCase()), title: '', page: r.p, printed: r.n, href: href(r.p) });
    });
    if (here.length >= 3) continue; // a contents page, not the headings themselves
    for (const e of here) {
      const last = found[found.length - 1];
      if (last && last.label === e.label) continue;
      if (/^Appendix/.test(e.label) && found.some((f) => /^Appendix/.test(f.label))) continue; // one line for all appendices
      if (/^(Part|Book)/.test(e.label)) { part = e.title ? `${e.label}: ${e.title}` : e.label; continue; }
      found.push({ ...e, label: /^Appendix/.test(e.label) ? 'Appendices' : e.label, part: part || undefined });
    }
  }
  // Too few headings with names: fall back to the reader pages of the volume that cover the book.
  const named = found.filter((e) => e.title).length;
  let entries = found;
  if (found.length < 2 || named < found.length / 2) {
    entries = [];
    const seen = new Set<string>();
    for (const r of pagesOf(vol)) {
      if (r.p < start || r.p > end) continue;
      const leaf = leafForPage(vol, r.p);
      if (!leaf || seen.has(leaf.slug)) continue;
      seen.add(leaf.slug);
      entries.push({ label: leaf.label, title: '', page: Math.max(r.p, leaf.start), printed: r.n, href: url(`/library/${vol.id}/${leaf.slug}/`) });
    }
  }
  return { id, vol, start, end, printed: ranges.map((r) => r.printed).join(', '), entries, work };
}

export const bookHref = (id: string, vol: Volume) => url(`/library/${vol.id}/books/${id}/`);
