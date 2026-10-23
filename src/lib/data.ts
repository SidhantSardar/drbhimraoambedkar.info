import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { loadImages, inLang } from './images-core.mjs';
import type { Lang } from '../i18n';

/**
 * Read src/data/<name>.json — or, for Marathi, its translation src/data/mr/<name>.json (same structure).
 * Returns the fallback if the research file isn't there yet.
 */
export function loadJSON<T>(name: string, fallback: T, lang: Lang = 'en'): T {
  if (lang === 'mr') {
    try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/mr', `${name}.json`), 'utf8')) as T; } catch {}
  }
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data', `${name}.json`), 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export type Img = {
  id: string; file: string; title?: string; caption?: string; date?: string; people?: string[]; place?: string;
  author?: string; license?: string; licenseUrl?: string; sourceUrl?: string; sourceName?: string;
  width?: number; height?: number; tags?: string[];
};
export const images = (lang: Lang = 'en'): Img[] => (loadImages() as Img[]).map((i) => inLang(i, lang));

export type Work = {
  id: string; title: string; altTitles?: string[]; type: string; year?: number | string; yearNote?: string;
  language?: string; status?: string; summary?: string; whyItMatters?: string; topics?: string[];
  baws?: { volume?: string; pages?: string; url?: string }[];
  online?: { label: string; url: string }[];
  physical?: { holder: string; location?: string; note?: string; url?: string }[];
  sources?: string[];
};
export type Speech = {
  id: string; date?: string; place?: string; title: string; occasion?: string; audience?: string; summary?: string;
  keyIdea?: string; source?: { label?: string; url?: string }; baws?: { volume?: string; pages?: string; url?: string };
  audioOrVideo?: string | null;
};

// Marathi chapters live in src/content/mr/; any chapter not translated yet is shown in English.
async function inLanguage<E extends { id: string }>(english: E[], marathi: E[], lang: Lang): Promise<E[]> {
  if (lang !== 'mr') return english;
  return english.map((e) => marathi.find((m) => m.id === e.id) || e);
}
export async function chapters(lang: Lang = 'en') {
  const en = (await getCollection('life')).sort((a, b) => a.data.order - b.data.order);
  return inLanguage(en, (await getCollection('lifeMr')) as any, lang);
}
export async function themes(lang: Lang = 'en') {
  const en = (await getCollection('themes')).sort((a, b) => a.data.order - b.data.order);
  return inLanguage(en, (await getCollection('themesMr')) as any, lang);
}
/** The Marathi version of a chapter or theme, if it has been translated. */
export async function storyIn(entry: Story, kind: 'life' | 'themes', lang: Lang): Promise<Story> {
  if (lang !== 'mr') return entry;
  const mr = await getCollection(kind === 'life' ? 'lifeMr' : 'themesMr');
  return ((mr as any[]).find((m) => m.id === entry.id) as Story) || entry;
}
export type Story = CollectionEntry<'life'> | CollectionEntry<'themes'>;
