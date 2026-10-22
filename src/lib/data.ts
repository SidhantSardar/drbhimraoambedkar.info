import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { loadImages } from './images-core.mjs';

/** Read src/data/<name>.json; returns the fallback if the research file isn't there yet. */
export function loadJSON<T>(name: string, fallback: T): T {
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
export const images = (): Img[] => loadImages() as Img[];

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

export async function chapters() {
  return (await getCollection('life')).sort((a, b) => a.data.order - b.data.order);
}
export async function themes() {
  return (await getCollection('themes')).sort((a, b) => a.data.order - b.data.order);
}
export type Story = CollectionEntry<'life'> | CollectionEntry<'themes'>;
