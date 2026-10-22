import { loadJSON, images } from './data';
import { url } from './site';

export type Report = { title: string; outlet: string; link: string; date: string | null; snippet?: string };
export type Story = {
  id: string; title: string; category: string; image: string | null; date: string | null;
  outlets: string[]; reports: Report[]; summary?: string;
};

export const CATEGORIES: Record<string, { cls: string; label: string; fallback: string }> = {
  'Protests & justice': { cls: 'cat-protests', label: 'Protest & justice', fallback: 'bhima-koregaon-vijaystambha-1927' },
  'Research & reports': { cls: 'cat-research', label: 'Research', fallback: 'riddles-in-hinduism-handwriting' },
  'Social work & community': { cls: 'cat-social', label: 'Social work', fallback: 'peoples-education-society-1945' },
  'Ambedkarite events': { cls: 'cat-events', label: 'Events', fallback: 'ambedkar-jayanti-2026' },
  Achievers: { cls: 'cat-achievers', label: 'Achievers', fallback: 'scf-womens-conference-nagpur-1942' },
  'Constitution & rights': { cls: 'cat-rights', label: 'Rights', fallback: 'constitution-preamble-page-calligraphed' },
  'Ambedkar in the news': { cls: 'cat-events', label: 'Ambedkar', fallback: 'ambedkar-portrait-classic' },
  'Ambedkarite voices': { cls: 'cat-voices', label: 'Voices', fallback: 'mooknayak-bahishkrit-bharat-mastheads' },
};

export function loadNews() {
  return loadJSON<{ updated?: string; stories: Story[] }>('news', { stories: [] });
}

export function catOf(s: Story) {
  return CATEGORIES[s.category] || { cls: '', label: s.category, fallback: 'ambedkar-portrait-classic' };
}

/** A matching photograph from the site's archive (used when a story has no picture, or its picture fails). */
export function fallbackFor(s: Story, width: 480 | 960 = 480) {
  const img = images().find((i) => i.id === catOf(s).fallback) || images()[0];
  if (!img) return '';
  const name = img.file.split('/').pop()!.replace(/\.[^.]+$/, '');
  return url(`/images/r/${name}-${width}.webp`);
}

/** The story's own picture, or a matching photograph from the site's archive. */
export function thumbFor(s: Story, width: 480 | 960 = 480) {
  return s.image || fallbackFor(s, width);
}

/** onerror handler: swap a broken news picture for the archive photo in data-fallback. */
export const ONERROR = 'this.onerror=null;this.src=this.dataset.fallback';

/** Newest first, mixing categories so every kind of news shows up near the top. */
export function mixed(stories: Story[], limit: number) {
  const byCat = new Map<string, Story[]>();
  const score = (s: Story) => (s.image ? 2 : 0) + Math.min(s.outlets.length, 4) + (isHindi(s.title) ? 0 : 1);
  for (const s of [...stories].sort((a, b) => score(b) - score(a) || String(b.date).localeCompare(String(a.date)))) {
    if (!byCat.has(s.category)) byCat.set(s.category, []);
    byCat.get(s.category)!.push(s);
  }
  const out: Story[] = [];
  for (let round = 0; out.length < limit && round < 50; round++) {
    for (const list of byCat.values()) if (list[round] && out.length < limit) out.push(list[round]);
  }
  return out;
}

export const isHindi = (t: string) => /[ऀ-ॿ]/.test(t);
